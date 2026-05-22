package com.stepup.promotions.dto;

import java.time.Instant;
import java.util.UUID;

public record PromotionResponse(
        UUID id,
        String title,
        String subtitle,
        String imageUrl,
        String linkUrl,
        String linkLabel,
        String badgeText,
        Boolean active,
        Integer position,
        Instant startsAt,
        Instant endsAt,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {
}
