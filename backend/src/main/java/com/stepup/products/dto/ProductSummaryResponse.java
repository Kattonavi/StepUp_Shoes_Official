package com.stepup.products.dto;

import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductSummaryResponse(
        UUID id,
        String name,
        String slug,
        UUID categoryId,
        String categoryName,
        BigDecimal price,
        BigDecimal oldPrice,
        BigDecimal discountPercentage,
        String referenceCode,
        ProductStatus status,
        StockStatus stockStatus,
        Boolean isNew,
        Boolean isOnSale,
        Boolean isFeatured,
        Boolean visible,
        String mainImageUrl,
        Instant createdAt
) {}
