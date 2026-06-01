package com.stepup.storefront.dto;

/**
 * Resumen ejecutivo de interés de clientes en un rango de tiempo.
 * conversionRateApprox = whatsappClicks / productViews (0 si no hay vistas).
 */
public record StorefrontSummaryResponse(
        long totalProductViews,
        long totalWhatsappClicks,
        long totalPromotionClicks,
        double conversionRateApprox,
        String mostViewedProductName,
        String mostViewedProductSlug,
        String mostConsultedProductName,
        String mostConsultedProductSlug,
        String mostViewedCategoryName
) {}
