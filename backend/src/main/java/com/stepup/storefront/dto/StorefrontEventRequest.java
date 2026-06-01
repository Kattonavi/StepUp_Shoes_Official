package com.stepup.storefront.dto;

import com.stepup.storefront.enums.StorefrontEventType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;
import java.util.UUID;

/**
 * Body para POST /api/v1/storefront-events.
 *
 * Solo eventType es obligatorio. El resto es opcional y se sanea/recorta en el
 * servicio. No se aceptan datos personales: sin email, teléfono ni nombre del
 * visitante. `sessionId` es un id anónimo del cliente (se hashea en servidor).
 */
public record StorefrontEventRequest(
        @NotNull(message = "eventType is required")
        StorefrontEventType eventType,

        UUID productId,
        @Size(max = 255) String productSlug,
        @Size(max = 255) String productName,

        UUID categoryId,
        @Size(max = 255) String categorySlug,
        @Size(max = 255) String categoryName,

        UUID promotionId,
        @Size(max = 255) String promotionTitle,

        @Size(max = 50)  String selectedSize,
        @Size(max = 50)  String stockStatus,
        @Size(max = 255) String sourcePage,

        Map<String, Object> metadata,

        @Size(max = 200) String sessionId
) {}
