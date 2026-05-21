package com.stepup.products.dto;

import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String slug,
        String description,
        UUID categoryId,
        String categoryName,
        String categorySlug,
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
        String seoTitle,
        String seoDescription,
        Integer displayOrder,
        List<ProductImageResponse> images,
        List<ProductSizeResponse> sizes,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {}
