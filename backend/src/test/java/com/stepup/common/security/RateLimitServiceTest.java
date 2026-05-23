package com.stepup.common.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("RateLimitService Unit Tests")
class RateLimitServiceTest {

    private RateLimitProperties properties;
    private RateLimitService service;

    @BeforeEach
    void setUp() {
        properties = new RateLimitProperties();
        // Tight bucket for tests: 3 attempts / 1 minute window.
        properties.setLogin(new RateLimitProperties.Bucket(3, 1));
        properties.setContact(new RateLimitProperties.Bucket(2, 1));
        properties.setAnalytics(new RateLimitProperties.Bucket(5, 1));
        service = new RateLimitService(properties);
    }

    @Test
    @DisplayName("allows attempts within the limit")
    void allowsWithinLimit() {
        for (int i = 0; i < 3; i++) {
            assertThat(service.check(RateLimitService.Endpoint.LOGIN, "key-a"))
                    .as("attempt %d should pass", i + 1)
                    .isTrue();
        }
    }

    @Test
    @DisplayName("blocks once the limit is exceeded")
    void blocksAtLimit() {
        for (int i = 0; i < 3; i++) {
            service.check(RateLimitService.Endpoint.LOGIN, "key-b");
        }
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "key-b")).isFalse();
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "key-b")).isFalse();
    }

    @Test
    @DisplayName("separate keys do not share counters")
    void independentKeys() {
        for (int i = 0; i < 3; i++) {
            service.check(RateLimitService.Endpoint.LOGIN, "key-c");
        }
        // key-c is now full; key-d is still fresh.
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "key-c")).isFalse();
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "key-d")).isTrue();
    }

    @Test
    @DisplayName("separate endpoints do not share counters")
    void independentEndpoints() {
        for (int i = 0; i < 3; i++) {
            service.check(RateLimitService.Endpoint.LOGIN, "shared-key");
        }
        // LOGIN is full for this key — CONTACT should still work (until its own limit).
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "shared-key")).isFalse();
        assertThat(service.check(RateLimitService.Endpoint.CONTACT, "shared-key")).isTrue();
        assertThat(service.check(RateLimitService.Endpoint.CONTACT, "shared-key")).isTrue();
        // contact bucket is 2 — third attempt blocked.
        assertThat(service.check(RateLimitService.Endpoint.CONTACT, "shared-key")).isFalse();
    }

    @Test
    @DisplayName("reset clears the counter for one key")
    void resetClearsCounter() {
        for (int i = 0; i < 3; i++) {
            service.check(RateLimitService.Endpoint.LOGIN, "key-e");
        }
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "key-e")).isFalse();

        service.reset(RateLimitService.Endpoint.LOGIN, "key-e");

        // Counter cleared — caller can try again.
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "key-e")).isTrue();
    }

    @Test
    @DisplayName("disabled limiter always allows")
    void disabledAlwaysAllows() {
        properties.setEnabled(false);
        for (int i = 0; i < 50; i++) {
            assertThat(service.check(RateLimitService.Endpoint.LOGIN, "key-f")).isTrue();
        }
    }

    @Test
    @DisplayName("null/blank key is allowed (avoids breaking callers without identifiers)")
    void nullKeyAllowed() {
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, null)).isTrue();
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "")).isTrue();
        assertThat(service.check(RateLimitService.Endpoint.LOGIN, "   ")).isTrue();
    }

    @Test
    @DisplayName("evictStale removes drained entries but keeps active ones")
    void evictStaleRemovesEmpty() {
        // Add 3 attempts on key-g, then reset (removes the key entirely).
        for (int i = 0; i < 3; i++) {
            service.check(RateLimitService.Endpoint.LOGIN, "key-g");
        }
        service.reset(RateLimitService.Endpoint.LOGIN, "key-g");

        // Add 1 attempt on key-h (still has activity).
        service.check(RateLimitService.Endpoint.LOGIN, "key-h");

        int before = service.trackedKeys();
        service.evictStale();
        int after = service.trackedKeys();

        // The reset key was already gone, so eviction shouldn't shrink further.
        // key-h should still be present.
        assertThat(after).isLessThanOrEqualTo(before);
        assertThat(after).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("clear empties all state (test helper)")
    void clearEmptiesState() {
        service.check(RateLimitService.Endpoint.LOGIN, "key-i");
        service.check(RateLimitService.Endpoint.CONTACT, "key-j");
        assertThat(service.trackedKeys()).isGreaterThan(0);

        service.clear();
        assertThat(service.trackedKeys()).isZero();
    }
}
