package com.stepup.audit.service;

import com.stepup.audit.entity.EntitySnapshot;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.enums.SnapshotReason;
import com.stepup.audit.repository.EntitySnapshotRepository;
import com.stepup.common.exception.SnapshotNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EntitySnapshotService {

    private final EntitySnapshotRepository snapshotRepository;

    @Transactional(readOnly = true)
    public Page<EntitySnapshot> listSnapshots(AuditableEntityType entityType,
                                              UUID entityId,
                                              SnapshotReason reason,
                                              Instant from,
                                              Instant to,
                                              Pageable pageable) {

        Specification<EntitySnapshot> spec = buildSpec(entityType, entityId, reason, from, to);
        return snapshotRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public EntitySnapshot getById(UUID id) {
        return snapshotRepository.findById(id)
                .orElseThrow(() -> new SnapshotNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<EntitySnapshot> getRecentByEntity(AuditableEntityType entityType, UUID entityId) {
        return snapshotRepository.findTop5ByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    private Specification<EntitySnapshot> buildSpec(AuditableEntityType entityType,
                                                     UUID entityId,
                                                     SnapshotReason reason,
                                                     Instant from,
                                                     Instant to) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (entityType != null) predicates.add(cb.equal(root.get("entityType"), entityType));
            if (entityId != null)   predicates.add(cb.equal(root.get("entityId"), entityId));
            if (reason != null)     predicates.add(cb.equal(root.get("snapshotReason"), reason));
            if (from != null)       predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            if (to != null)         predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
