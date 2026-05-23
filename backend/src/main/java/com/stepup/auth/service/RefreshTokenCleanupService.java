package com.stepup.auth.service;

import com.stepup.auth.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Scheduled cleanup for the {@code refresh_tokens} table.
 *
 * Deletes physical rows once they meet ALL of these conditions:
 *   - expired (expires_at older than retention threshold), OR
 *   - revoked before the retention threshold.
 *
 * Active tokens (not revoked, not expired) are never deleted.
 *
 * Config:
 *   app.security.refresh-token.cleanup-enabled  (default: true)
 *   app.security.refresh-token.retention-days   (default: 30)
 *   app.security.refresh-token.cleanup-cron     (default: daily at 03:15 UTC)
 *
 * Disable in environments where the cron is not desired
 * (e.g. {@code REFRESH_TOKEN_CLEANUP_ENABLED=false}).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.security.refresh-token.cleanup-enabled:true}")
    private boolean cleanupEnabled;

    @Value("${app.security.refresh-token.retention-days:30}")
    private int retentionDays;

    /**
     * Runs daily at 03:15 UTC by default. Override with
     * {@code REFRESH_TOKEN_CLEANUP_CRON} if a different window is preferred.
     */
    @Scheduled(cron = "${app.security.refresh-token.cleanup-cron:0 15 3 * * *}", zone = "UTC")
    @Transactional
    public void cleanupExpiredAndRevoked() {
        if (!cleanupEnabled) {
            log.debug("Refresh-token cleanup skipped (disabled).");
            return;
        }

        int days = Math.max(1, retentionDays);
        Instant threshold = Instant.now().minus(days, ChronoUnit.DAYS);

        int expired = refreshTokenRepository.deleteExpiredBefore(threshold);
        int revoked = refreshTokenRepository.deleteRevokedBefore(threshold);

        int total = expired + revoked;
        if (total > 0) {
            log.info("Refresh-token cleanup: deleted {} expired and {} revoked rows older than {} days.",
                    expired, revoked, days);
        } else {
            log.debug("Refresh-token cleanup: nothing to delete (retention {} days).", days);
        }
    }

    /**
     * Exposed for manual invocation in tests. Returns the total number of
     * deleted rows. Does NOT honor the {@code cleanupEnabled} flag.
     */
    @Transactional
    public int runOnce(int retentionDaysOverride) {
        int days = Math.max(1, retentionDaysOverride);
        Instant threshold = Instant.now().minus(days, ChronoUnit.DAYS);
        int expired = refreshTokenRepository.deleteExpiredBefore(threshold);
        int revoked = refreshTokenRepository.deleteRevokedBefore(threshold);
        return expired + revoked;
    }
}
