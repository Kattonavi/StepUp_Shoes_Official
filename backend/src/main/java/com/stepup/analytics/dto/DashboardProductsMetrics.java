package com.stepup.analytics.dto;

public record DashboardProductsMetrics(
        long total,
        long active,
        long draft,
        long hidden,
        long deleted,
        long featured,
        long isNew,
        long onSale,
        long outOfStock,
        long available,
        long onRequest,
        long notVisible
) {
}
