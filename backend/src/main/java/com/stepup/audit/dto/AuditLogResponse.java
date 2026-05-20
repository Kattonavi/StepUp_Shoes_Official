package com.stepup.audit.dto;

import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID actorUserId,
        String actorEmail,
        String actorRole,
        AuditAction action,
        AuditableEntityType entityType,
        UUID entityId,
        String description,
        Instant createdAt
) {}
