package com.stepup.audit.dto;

import com.stepup.audit.enums.AuditableEntityType;

import java.time.Instant;
import java.util.UUID;

public record DeletedItemResponse(
        AuditableEntityType entityType,
        UUID entityId,
        String entityName,
        Instant deletedAt,
        UUID deletedBy,
        UUID latestSnapshotId
) {}
