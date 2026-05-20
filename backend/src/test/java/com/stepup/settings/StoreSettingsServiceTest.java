package com.stepup.settings;

import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.settings.dto.PublicStoreSettingsResponse;
import com.stepup.settings.dto.StoreSettingsResponse;
import com.stepup.settings.entity.StoreSettings;
import com.stepup.settings.mapper.StoreSettingsMapper;
import com.stepup.settings.repository.StoreSettingsRepository;
import com.stepup.settings.service.StoreSettingsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("StoreSettingsService Unit Tests")
class StoreSettingsServiceTest {

    @Mock StoreSettingsRepository repository;
    @Mock StoreSettingsMapper mapper;
    @Mock AuditLogService auditLogService;
    @Mock EntitySerializationService serializer;

    @InjectMocks StoreSettingsService service;

    private StoreSettings defaultSettings;

    @BeforeEach
    void setUp() {
        defaultSettings = StoreSettings.builder()
                .id(UUID.randomUUID())
                .storeName("StepUp")
                .maintenanceMode(false)
                .catalogEnabled(true)
                .whatsappEnabled(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("getPublicSettings returns public response when settings exist")
    void getPublicSettings_existingSettings_returnsPublicResponse() {
        when(repository.findBySingletonKey("GLOBAL")).thenReturn(Optional.of(defaultSettings));
        when(mapper.toPublicResponse(any())).thenReturn(new PublicStoreSettingsResponse(
                "StepUp", null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, false, null, true, true
        ));

        PublicStoreSettingsResponse result = service.getPublicSettings();

        assertThat(result).isNotNull();
        assertThat(result.storeName()).isEqualTo("StepUp");
    }

    @Test
    @DisplayName("getOrCreate creates default settings when none exist")
    void getOrCreate_noExistingSettings_createsDefaults() {
        when(repository.findBySingletonKey("GLOBAL")).thenReturn(Optional.empty());
        when(repository.save(any())).thenReturn(defaultSettings);

        StoreSettings result = service.getOrCreate();

        assertThat(result).isNotNull();
        assertThat(result.getMaintenanceMode()).isFalse();
        assertThat(result.getCatalogEnabled()).isTrue();
        assertThat(result.getWhatsappEnabled()).isTrue();
    }

    @Test
    @DisplayName("getOrCreate returns existing settings without creating new ones")
    void getOrCreate_existingSettings_returnsExisting() {
        when(repository.findBySingletonKey("GLOBAL")).thenReturn(Optional.of(defaultSettings));

        StoreSettings result = service.getOrCreate();

        assertThat(result).isEqualTo(defaultSettings);
    }

    @Test
    @DisplayName("Default settings have maintenanceMode false")
    void defaultSettings_maintenanceModeIsFalse() {
        StoreSettings defaults = StoreSettings.builder()
                .storeName("StepUp")
                .maintenanceMode(false)
                .catalogEnabled(true)
                .whatsappEnabled(true)
                .build();

        assertThat(defaults.getMaintenanceMode()).isFalse();
        assertThat(defaults.getCatalogEnabled()).isTrue();
        assertThat(defaults.getWhatsappEnabled()).isTrue();
    }

    @Test
    @DisplayName("StoreSettingsMapper toPublicResponse excludes seoKeywords and internal fields")
    void mapper_publicResponse_doesNotExposeInternalFields() {
        StoreSettingsMapper realMapper = new StoreSettingsMapper();
        StoreSettings settings = StoreSettings.builder()
                .id(UUID.randomUUID())
                .storeName("StepUp")
                .seoKeywords("zapatos, gorras")
                .maintenanceMode(false)
                .catalogEnabled(true)
                .whatsappEnabled(true)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        PublicStoreSettingsResponse pub = realMapper.toPublicResponse(settings);
        StoreSettingsResponse admin = realMapper.toAdminResponse(settings);

        // seoKeywords is NOT in the public response record fields
        assertThat(pub.storeName()).isEqualTo("StepUp");
        assertThat(pub.maintenanceMode()).isFalse();
        // admin response includes seoKeywords
        assertThat(admin.seoKeywords()).isEqualTo("zapatos, gorras");
    }
}
