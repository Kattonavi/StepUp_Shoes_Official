package com.stepup.promotions.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdatePromotionRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 500) String subtitle,
        @Size(max = 1000) String imageUrl,
        @Size(max = 1000) String linkUrl,
        @Size(max = 100) String linkLabel,
        @Size(max = 50) String badgeText,
        Boolean active,
        Integer position,
        Instant startsAt,
        Instant endsAt
) {
}
