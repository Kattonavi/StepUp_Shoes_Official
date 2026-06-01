package com.stepup.storefront.dto;

import java.util.UUID;

public record TopCategoryRow(
        UUID categoryId,
        String categoryName,
        String categorySlug,
        long views,
        long whatsappClicks
) {}
