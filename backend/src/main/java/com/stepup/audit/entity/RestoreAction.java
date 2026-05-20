package com.stepup.audit.entity;

import com.stepup.audit.enums.AuditableEntityType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "restore_actions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestoreAction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "snapshot_id", nullable = false)
    private EntitySnapshot snapshot;

    @Column(name = "restored_by_user_id", nullable = false, columnDefinition = "uuid")
    private UUID restoredByUserId;

    @Column(name = "restored_by_email", length = 255)
    private String restoredByEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 50)
    private AuditableEntityType entityType;

    @Column(name = "entity_id", nullable = false, columnDefinition = "uuid")
    private UUID entityId;

    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_restore_data", columnDefinition = "jsonb")
    private String beforeRestoreData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_restore_data", columnDefinition = "jsonb")
    private String afterRestoreData;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }
}
