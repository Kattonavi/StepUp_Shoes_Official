package com.stepup.audit.mapper;

import com.stepup.audit.dto.EntitySnapshotDetailResponse;
import com.stepup.audit.dto.EntitySnapshotResponse;
import com.stepup.audit.entity.EntitySnapshot;

public final class EntitySnapshotMapper {

    private EntitySnapshotMapper() {}

    public static EntitySnapshotResponse toResponse(EntitySnapshot s) {
        return new EntitySnapshotResponse(
                s.getId(),
                s.getAuditLog() != null ? s.getAuditLog().getId() : null,
                s.getEntityType(),
                s.getEntityId(),
                s.getSnapshotReason(),
                s.getBeforeData() != null,
                s.getAfterData() != null,
                s.getCreatedAt()
        );
    }

    public static EntitySnapshotDetailResponse toDetailResponse(EntitySnapshot s) {
        return new EntitySnapshotDetailResponse(
                s.getId(),
                s.getAuditLog() != null ? s.getAuditLog().getId() : null,
                s.getEntityType(),
                s.getEntityId(),
                s.getSnapshotReason(),
                s.getBeforeData(),
                s.getAfterData(),
                s.getCreatedAt()
        );
    }
}
