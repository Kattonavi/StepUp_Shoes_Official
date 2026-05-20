package com.stepup.analytics.dto;

public record DashboardCategoriesMetrics(
        long total,
        long active,
        long inactive,
        long deleted
) {
}
