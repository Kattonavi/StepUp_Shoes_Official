package com.stepup.products.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductSizeRequest(
        @NotBlank(message = "Size is required")
        @Size(max = 50)
        String size,

        @Min(value = 0, message = "Stock quantity must be >= 0")
        Integer stockQuantity,

        Boolean available
) {}
