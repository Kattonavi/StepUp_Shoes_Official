package com.stepup.products.dto;

import com.stepup.common.validation.SafeUrl;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductImageRequest(
        @NotBlank(message = "Image URL is required")
        @SafeUrl
        @Size(max = 1000)
        String url,

        @Size(max = 255)
        String altText,

        Integer position,

        Boolean mainImage
) {}
