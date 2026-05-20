package com.stepup.categories.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 255)
        String name,

        @Size(max = 255)
        String slug,

        @Size(max = 100)
        String icon,

        String description,

        @Min(value = 0, message = "Position must be >= 0")
        Integer position,

        Boolean active
) {}
