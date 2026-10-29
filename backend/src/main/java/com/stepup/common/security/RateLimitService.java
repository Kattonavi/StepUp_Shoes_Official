package com.stepup.common.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Per-key sliding-window rate limiter. Tracks recent attempt timestamps per
 * (endpoint, key) pair and rejects further attempts once the count within the
 * configured window exceeds the bucket's max.
 *
 * Each call to {@link #check(Endpoint, String)} both records an attempt and
 * decides whether to allow it. Successful logins can call {@link #reset(Endpoint, String)}
 * to clear the counter.
 *
 * A scheduled task ({@code @Scheduled}) sweeps stale entries every 10 minutes
 * so the map cannot grow without bound if attackers cycle through millions of
 * IPs. The sweep is cheap (only touches entries that are completely empty).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    public enum Endpoint {
        LOGIN, LOGIN_EMAIL, CONTACT, ANALYTICS
    }

    private final RateLimitProperties properties;

    /** Compound key "endpoint|caller-identifier" → recent attempt timestamps. */
    private final Map<String, Deque<Instant>> attempts = new ConcurrentHashMap<>();

    /**
     * Records an attempt and returns whether it should be allowed.
     *
     * Returns true if the limiter is disabled, or if the call falls within
     * the configured window. Returns false once the count exceeds the bucket
     * max — callers may then either throw RateLimitExceededException (login,
     * contact) or silently drop the request (analytics).
     */
    public boolean check(Endpoint endpoint, String key) {
        if (!properties.isEnabled()) return true;
        if (key == null || key.isBlank()) return true;

        RateLimitProperties.Bucket bucket = bucketFor(endpoint);
        if (bucket == null) return true;

        Duration window = Duration.ofMinutes(Math.max(1, bucket.getWindowMinutes()));
        int max = Math.max(1, bucket.getMaxAttempts());

        String compound = endpoint.name() + "|" + key;
        Instant now = Instant.now();
        Instant cutoff = now.minus(window);

        // computeIfAbsent + synchronize on the deque so we never race on a single key
        Deque<Instant> deque = attempts.computeIfAbsent(compound, k -> new ArrayDeque<>());

        synchronized (deque) {
            // Drop entries outside the window
            while (!deque.isEmpty() && deque.peekFirst().isBefore(cutoff)) {
                deque.pollFirst();
            }
            // Reject without recording — record-then-reject would let the
            // counter grow forever for an actively attacking client.
            if (deque.size() >= max) {
                return false;
            }
            deque.addLast(now);
            return true;
        }
    }

    /**
     * Clears the counter for {@code key} on {@code endpoint}. Use after a
     * successful login so a user who finally typed the right password is not
     * left rate-limited from earlier failures.
     */
    public void reset(Endpoint endpoint, String key) {
        if (key == null || key.isBlank()) return;
        attempts.remove(endpoint.name() + "|" + key);
    }

    private RateLimitProperties.Bucket bucketFor(Endpoint endpoint) {
        return switch (endpoint) {
            case LOGIN     -> properties.getLogin();
            case LOGIN_EMAIL -> properties.getLoginEmail();
            case CONTACT   -> properties.getContact();
            case ANALYTICS -> properties.getAnalytics();
        };
    }

    /**
     * Sweeps empty deques every 10 minutes. Cheap operation: it iterates
     * the map once and removes entries whose window is fully drained.
     * Keys with active attempts are left alone.
     */
    @Scheduled(fixedDelayString = "PT10M", initialDelayString = "PT2M")
    public void evictStale() {
        if (!properties.isEnabled() || attempts.isEmpty()) return;

        Instant globalCutoff = Instant.now().minus(Duration.ofHours(1));
        int removed = 0;

        Iterator<Map.Entry<String, Deque<Instant>>> it = attempts.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, Deque<Instant>> entry = it.next();
            Deque<Instant> deque = entry.getValue();
            synchronized (deque) {
                while (!deque.isEmpty() && deque.peekFirst().isBefore(globalCutoff)) {
                    deque.pollFirst();
                }
                if (deque.isEmpty()) {
                    it.remove();
                    removed++;
                }
            }
        }
        if (removed > 0) {
            log.debug("Rate-limit cleanup removed {} stale entries (map size now {})",
                    removed, attempts.size());
        }
    }

    // ─── Test helpers ────────────────────────────────────────────────────────

    /** Visible for testing — returns the number of tracked keys. */
    int trackedKeys() {
        return attempts.size();
    }

    /** Visible for testing — clears all state. */
    void clear() {
        attempts.clear();
    }
}
