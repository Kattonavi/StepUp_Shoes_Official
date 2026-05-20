package com.stepup.audit.service;

import com.stepup.audit.entity.AuditLog;
import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.repository.AuditLogRepository;
import com.stepup.audit.repository.EntitySnapshotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuditLogService Unit Tests")
class AuditLogServiceTest {

    @Mock private AuditLogRepository auditLogRepository;
    @Mock private EntitySnapshotRepository entitySnapshotRepository;

    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {
        auditLogService = new AuditLogService(auditLogRepository, entitySnapshotRepository);
    }

    @Test
    @DisplayName("log(action, entityType, entityId, description) creates AuditLog with no snapshot when no JSON provided")
    void log_withoutJson_createsOnlyAuditLog() {
        UUID entityId = UUID.randomUUID();
        when(auditLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        auditLogService.log(AuditAction.CREATE, AuditableEntityType.PRODUCT, entityId, "Created");

        verify(auditLogRepository).save(any());
        verify(entitySnapshotRepository, never()).save(any());
    }

    @Test
    @DisplayName("log with afterJson creates AuditLog AND EntitySnapshot")
    void log_withAfterJson_createsSnapshot() {
        UUID entityId = UUID.randomUUID();
        AuditLog fakeLog = AuditLog.builder()
                .id(UUID.randomUUID())
                .action(AuditAction.CREATE)
                .entityType(AuditableEntityType.PRODUCT)
                .entityId(entityId)
                .build();
        when(auditLogRepository.save(any())).thenReturn(fakeLog);
        when(entitySnapshotRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        auditLogService.log(AuditAction.CREATE, AuditableEntityType.PRODUCT, entityId,
                "Created", null, "{\"id\":\"" + entityId + "\"}");

        verify(auditLogRepository).save(any());
        verify(entitySnapshotRepository).save(any());
    }

    @Test
    @DisplayName("logAsSystem creates AuditLog with null actor fields")
    void logAsSystem_setsNullActor() {
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        when(auditLogRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        auditLogService.logAsSystem(AuditAction.SYSTEM_SEED, AuditableEntityType.SYSTEM, null, "Seeded SUPER_ADMIN");

        verify(auditLogRepository).save(captor.capture());
        AuditLog saved = captor.getValue();
        assertThat(saved.getActorUserId()).isNull();
        assertThat(saved.getActorEmail()).isNull();
        assertThat(saved.getActorRole()).isNull();
        assertThat(saved.getAction()).isEqualTo(AuditAction.SYSTEM_SEED);
    }

    @Test
    @DisplayName("log with both beforeJson and afterJson creates one snapshot")
    void log_withBothJsons_createsOneSnapshot() {
        UUID entityId = UUID.randomUUID();
        AuditLog fakeLog = AuditLog.builder().id(UUID.randomUUID())
                .action(AuditAction.UPDATE).entityType(AuditableEntityType.CATEGORY).entityId(entityId).build();
        when(auditLogRepository.save(any())).thenReturn(fakeLog);
        when(entitySnapshotRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        auditLogService.log(AuditAction.UPDATE, AuditableEntityType.CATEGORY, entityId,
                "Updated", "{\"name\":\"old\"}", "{\"name\":\"new\"}");

        verify(entitySnapshotRepository, times(1)).save(any());
    }
}
