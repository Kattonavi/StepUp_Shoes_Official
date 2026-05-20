package com.stepup.analytics.dto;

import com.stepup.analytics.enums.AnalyticsEventType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;
import java.util.UUID;

public record TrackEventRequest(

        @NotNull(message = "eventType es obligatorio")
        AnalyticsEventType eventType,

        UUID productId,

        @Size(max = 255)
        String productSlug,

        @Size(max = 255)
        String categorySlug,

        @Size(max = 500)
        String searchQuery,

        @Size(max = 100)
        String source,

        @Size(max = 1000)
        String path,

        @Size(max = 1000)
        String referrer,

        @Size(max = 128)
        String sessionId,

        Map<String, Object> metadata
) {
}
