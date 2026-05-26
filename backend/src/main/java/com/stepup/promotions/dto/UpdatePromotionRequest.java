package com.stepup.promotions.dto;

import com.stepup.common.validation.SafeUrl;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdatePromotionRequest(
        @NotBlank @Size(max = 255) String title,
        @Size(max = 500) String subtitle,
        @SafeUrl @Size(max = 1000) String imageUrl,
        @SafeUrl @Size(max = 1000) String linkUrl,
        @Size(max = 100) String linkLabel,
        @Size(max = 50) String badgeText,
        Boolean active,
        Boolean visible,
        Integer position,
        Instant startsAt,
        Instant endsAt,
        @Size(max = 255) String cloudinaryPublicId
) {
}
