package com.stepup.audit;

import com.stepup.audit.dto.AuditLogDetailResponse;
import com.stepup.audit.dto.AuditLogResponse;
import com.stepup.audit.dto.DeletedItemResponse;
import com.stepup.audit.dto.EntitySnapshotDetailResponse;
import com.stepup.audit.dto.EntitySnapshotResponse;
import com.stepup.audit.dto.RestoreActionResponse;
import com.stepup.audit.dto.RestoreRequest;
import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.enums.SnapshotReason;
import com.stepup.audit.mapper.AuditLogMapper;
import com.stepup.audit.mapper.EntitySnapshotMapper;
import com.stepup.audit.mapper.RestoreActionMapper;
import com.stepup.audit.service.ControlCenterService;
import com.stepup.audit.service.EntitySnapshotService;
import com.stepup.common.response.ApiResponse;
import com.stepup.common.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/control-center")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class ControlCenterController {

    private final ControlCenterService controlCenterService;
    private final EntitySnapshotService entitySnapshotService;

    // ─── Audit Logs ───────────────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) AuditableEntityType entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) UUID actorUserId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLogResponse> result = controlCenterService
                .listAuditLogs(action, entityType, entityId, actorUserId, from, to, pageable)
                .map(AuditLogMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/audit-logs/{id}")
    public ResponseEntity<ApiResponse<AuditLogDetailResponse>> getAuditLogDetail(@PathVariable UUID id) {
        var log = controlCenterService.getAuditLogDetail(id);
        var snapshots = entitySnapshotService.getRecentByEntity(log.getEntityType(), log.getEntityId());
        return ResponseEntity.ok(ApiResponse.ok(AuditLogMapper.toDetailResponse(log, snapshots)));
    }

    // ─── Snapshots ────────────────────────────────────────────────────────────

    @GetMapping("/snapshots")
    public ResponseEntity<ApiResponse<Page<EntitySnapshotResponse>>> getSnapshots(
            @RequestParam(required = false) AuditableEntityType entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) SnapshotReason reason,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<EntitySnapshotResponse> result = controlCenterService
                .listSnapshots(entityType, entityId, reason, from, to, pageable)
                .map(EntitySnapshotMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/snapshots/{id}")
    public ResponseEntity<ApiResponse<EntitySnapshotDetailResponse>> getSnapshotDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(
                EntitySnapshotMapper.toDetailResponse(controlCenterService.getSnapshotDetail(id))));
    }

    // ─── Deleted Items ────────────────────────────────────────────────────────

    @GetMapping("/deleted-items")
    public ResponseEntity<ApiResponse<Page<DeletedItemResponse>>> getDeletedItems(
            @RequestParam(required = false) AuditableEntityType entityType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(
                controlCenterService.getDeletedItems(entityType, pageable)));
    }

    // ─── Restore Actions ──────────────────────────────────────────────────────

    @GetMapping("/restore-actions")
    public ResponseEntity<ApiResponse<Page<RestoreActionResponse>>> getRestoreActions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size);
        Page<RestoreActionResponse> result = controlCenterService
                .listRestoreActions(pageable)
                .map(RestoreActionMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/restore/{snapshotId}")
    public ResponseEntity<ApiResponse<RestoreActionResponse>> restore(
            @PathVariable UUID snapshotId,
            @Valid @RequestBody RestoreRequest request) {

        var actor = SecurityUtils.requireCurrentUser();
        var result = controlCenterService.restoreFromSnapshot(snapshotId, request.reason(), actor);
        return ResponseEntity.ok(ApiResponse.ok(
                RestoreActionMapper.toResponse(result), "Entity restored successfully"));
    }

    // ─── Security activity (alias over audit-logs filtered by security actions) ─

    @GetMapping("/security/activity")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getSecurityActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AuditLogResponse> result = controlCenterService
                .listAuditLogs(null, AuditableEntityType.USER, null, null, null, null, pageable)
                .map(AuditLogMapper::toResponse);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
