package com.stepup.categories.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateCategoryStatusRequest(
        @NotNull(message = "active is required")
        Boolean active
) {}
