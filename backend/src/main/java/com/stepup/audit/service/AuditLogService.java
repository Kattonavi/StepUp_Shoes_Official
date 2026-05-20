package com.stepup.audit.service;

import com.stepup.audit.entity.AuditLog;
import com.stepup.audit.entity.EntitySnapshot;
import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.enums.SnapshotReason;
import com.stepup.audit.repository.AuditLogRepository;
import com.stepup.audit.repository.EntitySnapshotRepository;
import com.stepup.common.util.SecurityUtils;
import com.stepup.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.criteria.Predicate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final EntitySnapshotRepository entitySnapshotRepository;

    // ─── Core log method ──────────────────────────────────────────────────────

    /**
     * Creates an AuditLog entry. Actor is resolved from the current security context.
     * Optionally creates a paired EntitySnapshot when before/after JSON is provided.
     */
    @Transactional(propagation = Propagation.REQUIRED)
    public AuditLog log(AuditAction action,
                        AuditableEntityType entityType,
                        UUID entityId,
                        String description,
                        String beforeJson,
                        String afterJson) {

        User actor = SecurityUtils.getCurrentUser().orElse(null);
        return logInternal(action, entityType, entityId, description, beforeJson, afterJson, actor);
    }

    /** Explicit actor override — used by system events (seed, scheduled tasks). */
    @Transactional(propagation = Propagation.REQUIRED)
    public AuditLog logAsSystem(AuditAction action,
                                AuditableEntityType entityType,
                                UUID entityId,
                                String description) {
        return logInternal(action, entityType, entityId, description, null, null, null);
    }

    /** Shorthand for actions with no snapshot (e.g. LOGIN, STATUS_CHANGE without data). */
    @Transactional(propagation = Propagation.REQUIRED)
    public AuditLog log(AuditAction action,
                        AuditableEntityType entityType,
                        UUID entityId,
                        String description) {
        return log(action, entityType, entityId, description, null, null);
    }

    // ─── Query methods ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AuditLog> listLogs(AuditAction action,
                                   AuditableEntityType entityType,
                                   UUID entityId,
                                   UUID actorUserId,
                                   Instant from,
                                   Instant to,
                                   Pageable pageable) {

        Specification<AuditLog> spec = buildLogSpec(action, entityType, entityId, actorUserId, from, to);
        return auditLogRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public AuditLog getById(UUID id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new com.stepup.common.exception.AuditLogNotFoundException(id));
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private AuditLog logInternal(AuditAction action,
                                 AuditableEntityType entityType,
                                 UUID entityId,
                                 String description,
                                 String beforeJson,
                                 String afterJson,
                                 User actor) {

        AuditLog auditLog = AuditLog.builder()
                .actorUserId(actor != null ? actor.getId() : null)
                .actorEmail(actor != null ? actor.getEmail() : null)
                .actorRole(actor != null ? actor.getRole().name() : null)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .build();

        AuditLog saved = auditLogRepository.save(auditLog);

        if (beforeJson != null || afterJson != null) {
            SnapshotReason reason = resolveReason(action, beforeJson, afterJson);
            EntitySnapshot snapshot = EntitySnapshot.builder()
                    .auditLog(saved)
                    .entityType(entityType)
                    .entityId(entityId)
                    .beforeData(beforeJson)
                    .afterData(afterJson)
                    .snapshotReason(reason)
                    .build();
            entitySnapshotRepository.save(snapshot);
        }

        log.debug("Audit: action={}, entityType={}, entityId={}, actor={}",
                action, entityType, entityId, actor != null ? actor.getEmail() : "system");
        return saved;
    }

    private SnapshotReason resolveReason(AuditAction action, String before, String after) {
        return switch (action) {
            case CREATE -> SnapshotReason.AFTER_UPDATE;
            case UPDATE, STATUS_CHANGE, ROLE_CHANGE, VISIBILITY_CHANGE, STOCK_CHANGE ->
                    before != null ? SnapshotReason.BEFORE_UPDATE : SnapshotReason.AFTER_UPDATE;
            case SOFT_DELETE, DELETE -> SnapshotReason.BEFORE_DELETE;
            case RESTORE -> SnapshotReason.AFTER_RESTORE;
            default -> SnapshotReason.SYSTEM;
        };
    }

    private Specification<AuditLog> buildLogSpec(AuditAction action,
                                                   AuditableEntityType entityType,
                                                   UUID entityId,
                                                   UUID actorUserId,
                                                   Instant from,
                                                   Instant to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (action != null)      predicates.add(cb.equal(root.get("action"), action));
            if (entityType != null)  predicates.add(cb.equal(root.get("entityType"), entityType));
            if (entityId != null)    predicates.add(cb.equal(root.get("entityId"), entityId));
            if (actorUserId != null) predicates.add(cb.equal(root.get("actorUserId"), actorUserId));
            if (from != null)        predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            if (to != null)          predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
