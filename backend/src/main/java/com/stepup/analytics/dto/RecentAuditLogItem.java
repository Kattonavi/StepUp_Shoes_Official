package com.stepup.analytics.dto;

import java.time.Instant;
import java.util.UUID;

public record RecentAuditLogItem(
        UUID id,
        String actorEmail,
        String actorRole,
        String action,
        String entityType,
        UUID entityId,
        String description,
        Instant createdAt
) {
}
