package com.stepup.products.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductImageRequest(
        @NotBlank(message = "Image URL is required")
        @Size(max = 1000)
        String url,

        @Size(max = 255)
        String altText,

        Integer position,

        Boolean mainImage
) {}
