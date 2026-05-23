package com.stepup.promotions.dto;

import jakarta.validation.constraints.NotNull;

public record UpdatePromotionActiveRequest(
        @NotNull(message = "active is required") Boolean active
) {
}
