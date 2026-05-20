package com.stepup.products.dto;

import java.util.UUID;

public record ProductSizeResponse(
        UUID id,
        String size,
        Integer stockQuantity,
        Boolean available
) {}
