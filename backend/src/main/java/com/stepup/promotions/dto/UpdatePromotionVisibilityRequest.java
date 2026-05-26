package com.stepup.promotions.dto;

import jakarta.validation.constraints.NotNull;

public record UpdatePromotionVisibilityRequest(
        @NotNull Boolean visible
) {
}
