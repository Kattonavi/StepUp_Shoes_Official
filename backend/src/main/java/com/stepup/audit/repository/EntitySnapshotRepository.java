package com.stepup.audit.repository;

import com.stepup.audit.entity.EntitySnapshot;
import com.stepup.audit.enums.AuditableEntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface EntitySnapshotRepository extends JpaRepository<EntitySnapshot, UUID>, JpaSpecificationExecutor<EntitySnapshot> {

    Page<EntitySnapshot> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            AuditableEntityType entityType, UUID entityId, Pageable pageable);

    List<EntitySnapshot> findTop5ByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            AuditableEntityType entityType, UUID entityId);
}
