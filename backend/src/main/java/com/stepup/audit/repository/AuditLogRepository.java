package com.stepup.audit.repository;

import com.stepup.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID>, JpaSpecificationExecutor<AuditLog> {

    // All querying is done through JpaSpecificationExecutor + AuditLogSpecification
    // No delete methods exposed — audit logs are immutable

    // --- Dashboard metrics ---

    List<AuditLog> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT a FROM AuditLog a WHERE a.createdAt >= :from ORDER BY a.createdAt ASC")
    List<AuditLog> findByCreatedAtAfter(@Param("from") Instant from);
}
