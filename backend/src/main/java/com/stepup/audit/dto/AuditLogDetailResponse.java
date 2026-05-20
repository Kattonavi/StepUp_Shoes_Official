package com.stepup.audit.dto;

import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AuditLogDetailResponse(
        UUID id,
        UUID actorUserId,
        String actorEmail,
        String actorRole,
        AuditAction action,
        AuditableEntityType entityType,
        UUID entityId,
        String description,
        String ipAddressHash,
        String userAgent,
        Instant createdAt,
        List<EntitySnapshotResponse> snapshots
) {}
