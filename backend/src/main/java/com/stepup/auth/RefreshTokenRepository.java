package com.stepup.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
            UPDATE RefreshToken rt
            SET rt.revokedAt = :revokedAt, rt.revokedByIp = :ip
            WHERE rt.tokenHash = :tokenHash
            """)
    int revokeByTokenHash(
            @Param("tokenHash") String tokenHash,
            @Param("revokedAt") Instant revokedAt,
            @Param("ip") String ip);

    @Modifying
    @Query("""
            UPDATE RefreshToken rt
            SET rt.revokedAt = :revokedAt
            WHERE rt.user.id = :userId
            AND rt.revokedAt IS NULL
            """)
    int revokeAllActiveByUserId(@Param("userId") UUID userId, @Param("revokedAt") Instant revokedAt);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :threshold")
    int deleteExpiredBefore(@Param("threshold") Instant threshold);

    /**
     * Deletes refresh tokens that were revoked before {@code threshold}.
     * Used by the scheduled cleanup to keep the table from growing without bound.
     * Active (non-revoked, non-expired) tokens are never deleted.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.revokedAt IS NOT NULL AND rt.revokedAt < :threshold")
    int deleteRevokedBefore(@Param("threshold") Instant threshold);
}
