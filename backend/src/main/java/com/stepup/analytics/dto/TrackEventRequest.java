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

        @Size(max = 180)
        String productSlug,

        @Size(max = 180)
        String categorySlug,

        @Size(max = 120)
        String searchQuery,

        @Size(max = 80)
        String source,

        @Size(max = 500)
        String path,

        @Size(max = 500)
        String referrer,

        @Size(max = 120)
        String sessionId,

        // Cardinality of `metadata` is enforced in AnalyticsEventService.sanitizeMetadata
        // (key count limited, per-value length limited, PII keys blocked).
        Map<String, Object> metadata
) {
}
