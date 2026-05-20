package com.stepup.audit.mapper;

import com.stepup.audit.dto.RestoreActionResponse;
import com.stepup.audit.entity.RestoreAction;

public final class RestoreActionMapper {

    private RestoreActionMapper() {}

    public static RestoreActionResponse toResponse(RestoreAction ra) {
        return new RestoreActionResponse(
                ra.getId(),
                ra.getSnapshot() != null ? ra.getSnapshot().getId() : null,
                ra.getRestoredByUserId(),
                ra.getRestoredByEmail(),
                ra.getEntityType(),
                ra.getEntityId(),
                ra.getReason(),
                ra.getCreatedAt()
        );
    }
}
