package com.stepup.audit.service;

import com.stepup.audit.dto.DeletedItemResponse;
import com.stepup.audit.entity.AuditLog;
import com.stepup.audit.entity.EntitySnapshot;
import com.stepup.audit.entity.RestoreAction;
import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.enums.SnapshotReason;
import com.stepup.audit.repository.EntitySnapshotRepository;
import com.stepup.audit.repository.RestoreActionRepository;
import com.stepup.categories.entity.Category;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.products.entity.Product;
import com.stepup.products.repository.ProductRepository;
import com.stepup.products.repository.ProductSpecification;
import com.stepup.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ControlCenterService {

    private final AuditLogService auditLogService;
    private final EntitySnapshotService entitySnapshotService;
    private final RestoreService restoreService;
    private final RestoreActionRepository restoreActionRepository;
    private final EntitySnapshotRepository entitySnapshotRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // ─── Audit logs ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AuditLog> listAuditLogs(AuditAction action,
                                         AuditableEntityType entityType,
                                         UUID entityId,
                                         UUID actorUserId,
                                         Instant from,
                                         Instant to,
                                         Pageable pageable) {
        return auditLogService.listLogs(action, entityType, entityId, actorUserId, from, to, pageable);
    }

    @Transactional(readOnly = true)
    public AuditLog getAuditLogDetail(UUID id) {
        return auditLogService.getById(id);
    }

    // ─── Snapshots ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<EntitySnapshot> listSnapshots(AuditableEntityType entityType,
                                               UUID entityId,
                                               SnapshotReason reason,
                                               Instant from,
                                               Instant to,
                                               Pageable pageable) {
        return entitySnapshotService.listSnapshots(entityType, entityId, reason, from, to, pageable);
    }

    @Transactional(readOnly = true)
    public EntitySnapshot getSnapshotDetail(UUID id) {
        return entitySnapshotService.getById(id);
    }

    // ─── Deleted items ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<DeletedItemResponse> getDeletedItems(AuditableEntityType entityType, Pageable pageable) {
        if (entityType == null || entityType == AuditableEntityType.PRODUCT) {
            return deletedProducts(pageable);
        }
        return switch (entityType) {
            case CATEGORY -> deletedCategories(pageable);
            case USER     -> deletedUsers(pageable);
            default       -> deletedProducts(pageable);
        };
    }

    private Page<DeletedItemResponse> deletedProducts(Pageable pageable) {
        return productRepository.findAll(ProductSpecification.deletedOnly(), pageable)
                .map(this::toDeletedItem);
    }

    private Page<DeletedItemResponse> deletedCategories(Pageable pageable) {
        return categoryRepository.findAllByDeletedAtIsNotNull(pageable)
                .map(this::toDeletedItem);
    }

    private Page<DeletedItemResponse> deletedUsers(Pageable pageable) {
        // Full implementation in Phase 4 (user management expansion)
        return Page.empty(pageable);
    }

    private DeletedItemResponse toDeletedItem(Product p) {
        UUID latestSnapshotId = entitySnapshotRepository
                .findTop5ByEntityTypeAndEntityIdOrderByCreatedAtDesc(AuditableEntityType.PRODUCT, p.getId())
                .stream().findFirst().map(EntitySnapshot::getId).orElse(null);
        return new DeletedItemResponse(AuditableEntityType.PRODUCT, p.getId(), p.getName(),
                p.getDeletedAt(), p.getDeletedBy(), latestSnapshotId);
    }

    private DeletedItemResponse toDeletedItem(Category c) {
        UUID latestSnapshotId = entitySnapshotRepository
                .findTop5ByEntityTypeAndEntityIdOrderByCreatedAtDesc(AuditableEntityType.CATEGORY, c.getId())
                .stream().findFirst().map(EntitySnapshot::getId).orElse(null);
        return new DeletedItemResponse(AuditableEntityType.CATEGORY, c.getId(), c.getName(),
                c.getDeletedAt(), c.getDeletedBy(), latestSnapshotId);
    }

    // ─── Restore actions ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<RestoreAction> listRestoreActions(Pageable pageable) {
        return restoreActionRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public RestoreAction restoreFromSnapshot(UUID snapshotId, String reason, User actor) {
        return restoreService.restoreFromSnapshot(snapshotId, reason, actor);
    }
}
