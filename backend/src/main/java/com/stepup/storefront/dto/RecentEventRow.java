package com.stepup.storefront.dto;

import java.time.Instant;

public record RecentEventRow(
        String eventType,
        String productName,
        String productSlug,
        String categoryName,
        String promotionTitle,
        String selectedSize,
        Instant createdAt
) {}
