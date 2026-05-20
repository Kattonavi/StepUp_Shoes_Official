package com.stepup.analytics.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecentProductItem(
        UUID id,
        String name,
        String slug,
        String status,
        String stockStatus,
        BigDecimal price,
        Instant createdAt,
        Instant updatedAt
) {
}
