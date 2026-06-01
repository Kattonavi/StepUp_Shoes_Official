package com.stepup.storefront.dto;

import java.util.UUID;

/**
 * Rendimiento de un producto publicado: vistas y consultas en el rango.
 * `views == 0` identifica productos publicados sin interacción.
 */
public record ProductPerformanceRow(
        UUID productId,
        String productName,
        String productSlug,
        String status,
        boolean visible,
        long views,
        long whatsappClicks
) {}
