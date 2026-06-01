package com.stepup.storefront.dto;

import java.time.Instant;
import java.util.UUID;

public record TopProductRow(
        UUID productId,
        String productName,
        String productSlug,
        String categoryName,
        long views,
        long whatsappClicks,
        double conversionRate,
        Instant lastEventAt
) {}
