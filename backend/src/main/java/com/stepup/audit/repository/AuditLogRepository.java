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

    /**
     * Returns daily audit-log counts since {@code from} grouped by UTC day.
     * Each row is [day:Date, count:Long]. Runs entirely in PostgreSQL.
     */
    @Query(value = """
            SELECT DATE_TRUNC('day', created_at AT TIME ZONE 'UTC')::date AS day,
                   COUNT(*)                                                AS log_count
            FROM audit_logs
            WHERE created_at >= :from
            GROUP BY day
            ORDER BY day ASC
            """, nativeQuery = true)
    List<Object[]> countByDaySince(@Param("from") Instant from);
}
