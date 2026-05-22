package com.stepup.promotions.repository;

import com.stepup.promotions.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PromotionRepository extends JpaRepository<Promotion, UUID> {

    Optional<Promotion> findByIdAndDeletedAtIsNull(UUID id);

    List<Promotion> findAllByDeletedAtIsNullOrderByPositionAsc();

    @Query("""
            SELECT p FROM Promotion p
            WHERE p.active = true
              AND p.deletedAt IS NULL
              AND (p.startsAt IS NULL OR p.startsAt <= :now)
              AND (p.endsAt   IS NULL OR p.endsAt   >= :now)
            ORDER BY p.position ASC
            """)
    List<Promotion> findAllActiveAndNotExpired(Instant now);

    long countByDeletedAtIsNull();

    long countByActiveTrueAndDeletedAtIsNull();
}
