package com.stepup.products.dto;

import com.stepup.products.enums.ProductStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateProductStatusRequest(
        @NotNull(message = "status is required")
        ProductStatus status
) {}
