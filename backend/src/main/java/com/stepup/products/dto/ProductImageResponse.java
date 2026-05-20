package com.stepup.products.dto;

import java.util.UUID;

public record ProductImageResponse(
        UUID id,
        String url,
        String altText,
        Integer position,
        Boolean mainImage
) {}
