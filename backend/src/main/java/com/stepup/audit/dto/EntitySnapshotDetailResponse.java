package com.stepup.audit.dto;

import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.enums.SnapshotReason;

import java.time.Instant;
import java.util.UUID;

public record EntitySnapshotDetailResponse(
        UUID id,
        UUID auditLogId,
        AuditableEntityType entityType,
        UUID entityId,
        SnapshotReason snapshotReason,
        String beforeData,
        String afterData,
        Instant createdAt
) {}
