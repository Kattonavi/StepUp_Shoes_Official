package com.stepup.audit.mapper;

import com.stepup.audit.dto.AuditLogDetailResponse;
import com.stepup.audit.dto.AuditLogResponse;
import com.stepup.audit.dto.EntitySnapshotResponse;
import com.stepup.audit.entity.AuditLog;
import com.stepup.audit.entity.EntitySnapshot;

import java.util.List;

public final class AuditLogMapper {

    private AuditLogMapper() {}

    public static AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorUserId(),
                log.getActorEmail(),
                log.getActorRole(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription(),
                log.getCreatedAt()
        );
    }

    public static AuditLogDetailResponse toDetailResponse(AuditLog log, List<EntitySnapshot> snapshots) {
        List<EntitySnapshotResponse> snapshotResponses = snapshots == null ? List.of()
                : snapshots.stream().map(EntitySnapshotMapper::toResponse).toList();

        return new AuditLogDetailResponse(
                log.getId(),
                log.getActorUserId(),
                log.getActorEmail(),
                log.getActorRole(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                log.getDescription(),
                log.getIpAddressHash(),
                log.getUserAgent(),
                log.getCreatedAt(),
                snapshotResponses
        );
    }
}
