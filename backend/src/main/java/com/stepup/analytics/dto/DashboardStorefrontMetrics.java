package com.stepup.analytics.dto;

/**
 * Resumen de interés de clientes para el dashboard (últimos 30 días).
 * conversionRate = whatsappClicks / productViews.
 */
public record DashboardStorefrontMetrics(
        long productViews,
        long whatsappClicks,
        double conversionRate,
        String mostConsultedProductName,
        String mostConsultedProductSlug
) {}
