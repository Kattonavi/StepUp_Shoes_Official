package com.stepup.analytics.dto;

import java.util.List;

public record DashboardSummaryResponse(
        DashboardProductsMetrics products,
        DashboardCategoriesMetrics categories,
        DashboardUsersMetrics users,
        DashboardActivityMetrics activity,
        List<ChartDataPoint> productsByStatus,
        List<ChartDataPoint> productsByStockStatus,
        List<ChartDataPoint> usersByRole,
        List<ChartDataPoint> auditLogsLast7Days
) {
}
