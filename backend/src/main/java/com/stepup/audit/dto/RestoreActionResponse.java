package com.stepup.audit.dto;

import com.stepup.audit.enums.AuditableEntityType;

import java.time.Instant;
import java.util.UUID;

public record RestoreActionResponse(
        UUID id,
        UUID snapshotId,
        UUID restoredByUserId,
        String restoredByEmail,
        AuditableEntityType entityType,
        UUID entityId,
        String reason,
        Instant createdAt
) {}
