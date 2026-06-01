package com.stepup.analytics.dto;

import java.util.List;

public record DashboardSummaryResponse(
        DashboardProductsMetrics products,
        DashboardCategoriesMetrics categories,
        DashboardUsersMetrics users,
        DashboardPromotionsMetrics promotions,
        DashboardActivityMetrics activity,
        // Interés de clientes (storefront, últimos 30 días). El frontend ya no
        // muestra métricas de usuarios; esto las reemplaza con valor de negocio.
        DashboardStorefrontMetrics storefront,
        List<ChartDataPoint> productsByStatus,
        List<ChartDataPoint> productsByStockStatus,
        List<ChartDataPoint> usersByRole,
        List<ChartDataPoint> auditLogsLast7Days
) {
}
