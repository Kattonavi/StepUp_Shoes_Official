package com.stepup.auth.service;

import com.stepup.auth.RefreshTokenRepository;
import org.assertj.core.data.Offset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RefreshTokenCleanupService Unit Tests")
class RefreshTokenCleanupServiceTest {

    @Mock RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenCleanupService service;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenCleanupService(refreshTokenRepository);
        ReflectionTestUtils.setField(service, "cleanupEnabled", true);
        ReflectionTestUtils.setField(service, "retentionDays", 30);
    }

    @Test
    @DisplayName("cleanup deletes expired and revoked tokens older than retention threshold")
    void cleanup_deletesBothExpiredAndRevoked() {
        when(refreshTokenRepository.deleteExpiredBefore(any())).thenReturn(5);
        when(refreshTokenRepository.deleteRevokedBefore(any())).thenReturn(3);

        service.cleanupExpiredAndRevoked();

        ArgumentCaptor<Instant> expiredCaptor = ArgumentCaptor.forClass(Instant.class);
        ArgumentCaptor<Instant> revokedCaptor = ArgumentCaptor.forClass(Instant.class);
        verify(refreshTokenRepository).deleteExpiredBefore(expiredCaptor.capture());
        verify(refreshTokenRepository).deleteRevokedBefore(revokedCaptor.capture());

        long expectedEpoch = Instant.now().minus(30, ChronoUnit.DAYS).getEpochSecond();
        assertThat(expiredCaptor.getValue().getEpochSecond())
                .isCloseTo(expectedEpoch, Offset.offset(5L));
        assertThat(revokedCaptor.getValue().getEpochSecond())
                .isCloseTo(expectedEpoch, Offset.offset(5L));
    }

    @Test
    @DisplayName("cleanup is a no-op when disabled")
    void cleanup_skipsWhenDisabled() {
        ReflectionTestUtils.setField(service, "cleanupEnabled", false);

        service.cleanupExpiredAndRevoked();

        verify(refreshTokenRepository, never()).deleteExpiredBefore(any());
        verify(refreshTokenRepository, never()).deleteRevokedBefore(any());
    }

    @Test
    @DisplayName("cleanup runs safely when nothing to delete")
    void cleanup_noRows_noError() {
        when(refreshTokenRepository.deleteExpiredBefore(any())).thenReturn(0);
        when(refreshTokenRepository.deleteRevokedBefore(any())).thenReturn(0);

        service.cleanupExpiredAndRevoked();

        verify(refreshTokenRepository).deleteExpiredBefore(any());
        verify(refreshTokenRepository).deleteRevokedBefore(any());
    }

    @Test
    @DisplayName("retentionDays of 0 is clamped to 1 to avoid wiping active tokens")
    void cleanup_clampsRetentionToAtLeastOneDay() {
        ReflectionTestUtils.setField(service, "retentionDays", 0);
        when(refreshTokenRepository.deleteExpiredBefore(any())).thenReturn(0);
        when(refreshTokenRepository.deleteRevokedBefore(any())).thenReturn(0);

        service.cleanupExpiredAndRevoked();

        ArgumentCaptor<Instant> captor = ArgumentCaptor.forClass(Instant.class);
        verify(refreshTokenRepository).deleteExpiredBefore(captor.capture());

        long oneDayAgoEpoch = Instant.now().minus(1, ChronoUnit.DAYS).getEpochSecond();
        assertThat(captor.getValue().getEpochSecond())
                .isCloseTo(oneDayAgoEpoch, Offset.offset(5L));
    }

    @Test
    @DisplayName("runOnce ignores enabled flag and returns total deleted rows")
    void runOnce_alwaysExecutes() {
        ReflectionTestUtils.setField(service, "cleanupEnabled", false);
        when(refreshTokenRepository.deleteExpiredBefore(any())).thenReturn(7);
        when(refreshTokenRepository.deleteRevokedBefore(any())).thenReturn(4);

        int deleted = service.runOnce(60);

        assertThat(deleted).isEqualTo(11);
        verify(refreshTokenRepository).deleteExpiredBefore(any());
        verify(refreshTokenRepository).deleteRevokedBefore(any());
    }
}
