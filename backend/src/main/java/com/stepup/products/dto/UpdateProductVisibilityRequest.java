package com.stepup.products.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateProductVisibilityRequest(
        @NotNull(message = "visible is required")
        Boolean visible
) {}
