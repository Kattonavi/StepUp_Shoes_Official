package com.stepup.settings.service;

import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.common.util.SecurityUtils;
import com.stepup.settings.dto.PublicStoreSettingsResponse;
import com.stepup.settings.dto.StoreSettingsResponse;
import com.stepup.settings.dto.UpdateStoreSettingsRequest;
import com.stepup.settings.entity.StoreSettings;
import com.stepup.settings.mapper.StoreSettingsMapper;
import com.stepup.settings.repository.StoreSettingsRepository;
import com.stepup.users.Role;
import com.stepup.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class StoreSettingsService {

    private static final String SINGLETON_KEY = "GLOBAL";

    private final StoreSettingsRepository repository;
    private final StoreSettingsMapper mapper;
    private final AuditLogService auditLogService;
    private final EntitySerializationService serializer;

    // ─── Public ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PublicStoreSettingsResponse getPublicSettings() {
        return mapper.toPublicResponse(getOrCreate());
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StoreSettingsResponse getAdminSettings() {
        requireAdminAccess();
        return mapper.toAdminResponse(getOrCreate());
    }

    @Transactional
    public StoreSettingsResponse updateSettings(UpdateStoreSettingsRequest req) {
        requireOwnerAccess();

        StoreSettings settings = getOrCreate();
        String before = serializer.serializeStoreSettingsToJson(settings);

        applyUpdate(settings, req);
        settings.setUpdatedBy(currentUserId());
        settings = repository.save(settings);

        auditLogService.log(
                AuditAction.UPDATE,
                AuditableEntityType.STORE_SETTINGS,
                settings.getId(),
                "Configuración de tienda actualizada",
                before,
                serializer.serializeStoreSettingsToJson(settings)
        );

        return mapper.toAdminResponse(settings);
    }

    // ─── Singleton helper ─────────────────────────────────────────────────────

    public StoreSettings getOrCreate() {
        return repository.findBySingletonKey(SINGLETON_KEY)
                .orElseGet(() -> repository.save(buildDefaults()));
    }

    private StoreSettings buildDefaults() {
        return StoreSettings.builder()
                .storeName("StepUp")
                .storeSlogan("Catálogo urbano de zapatos, ropa y accesorios.")
                .heroTitle("ENCUENTRA TU PRÓXIMO ESTILO")
                .heroSubtitle("PRODUCTOS SELECCIONADOS CON ATENCIÓN PERSONALIZADA")
                .heroCtaText("VER CATÁLOGO")
                .heroCtaUrl("/catalogo")
                .heroEyebrowText("NUEVA TEMPORADA")
                .heroBadgeText("STOCK LIMITADO")
                .heroSecondaryCtaText("PREGUNTA POR WHATSAPP")
                .heroStatOneValue("+50")
                .heroStatOneLabel("REFERENCIAS ACTIVAS")
                .heroStatTwoValue("WHATSAPP")
                .heroStatTwoLabel("ATENCIÓN RÁPIDA Y DIRECTA")
                .heroStatThreeValue("CURADOS")
                .heroStatThreeLabel("SELECCIÓN CON ESTILO Y CONFIANZA")
                .featuredSectionTitle("Productos destacados")
                .newArrivalsSectionTitle("Nuevos productos")
                .maintenanceMode(false)
                .catalogEnabled(true)
                .whatsappEnabled(true)
                .build();
    }

    private void applyUpdate(StoreSettings s, UpdateStoreSettingsRequest req) {
        if (req.storeName() != null) s.setStoreName(req.storeName());
        s.setStoreSlogan(nullIfBlank(req.storeSlogan()));
        s.setLogoUrl(nullIfBlank(req.logoUrl()));
        s.setFaviconUrl(nullIfBlank(req.faviconUrl()));
        s.setWhatsappNumber(nullIfBlank(req.whatsappNumber()));
        s.setWhatsappDefaultMessage(nullIfBlank(req.whatsappDefaultMessage()));
        s.setContactEmail(nullIfBlank(req.contactEmail()));
        s.setContactPhone(nullIfBlank(req.contactPhone()));
        s.setAddress(nullIfBlank(req.address()));
        s.setCity(nullIfBlank(req.city()));
        s.setCountry(nullIfBlank(req.country()));
        s.setInstagramUrl(nullIfBlank(req.instagramUrl()));
        s.setFacebookUrl(nullIfBlank(req.facebookUrl()));
        s.setTiktokUrl(nullIfBlank(req.tiktokUrl()));
        s.setYoutubeUrl(nullIfBlank(req.youtubeUrl()));
        s.setSeoTitle(nullIfBlank(req.seoTitle()));
        s.setSeoDescription(nullIfBlank(req.seoDescription()));
        s.setSeoKeywords(nullIfBlank(req.seoKeywords()));
        s.setOgImageUrl(nullIfBlank(req.ogImageUrl()));
        s.setHeroTitle(nullIfBlank(req.heroTitle()));
        s.setHeroSubtitle(nullIfBlank(req.heroSubtitle()));
        s.setHeroCtaText(nullIfBlank(req.heroCtaText()));
        s.setHeroCtaUrl(nullIfBlank(req.heroCtaUrl()));
        s.setHeroEyebrowText(nullIfBlank(req.heroEyebrowText()));
        s.setHeroBadgeText(nullIfBlank(req.heroBadgeText()));
        s.setHeroSecondaryCtaText(nullIfBlank(req.heroSecondaryCtaText()));
        s.setHeroStatOneValue(nullIfBlank(req.heroStatOneValue()));
        s.setHeroStatOneLabel(nullIfBlank(req.heroStatOneLabel()));
        s.setHeroStatTwoValue(nullIfBlank(req.heroStatTwoValue()));
        s.setHeroStatTwoLabel(nullIfBlank(req.heroStatTwoLabel()));
        s.setHeroStatThreeValue(nullIfBlank(req.heroStatThreeValue()));
        s.setHeroStatThreeLabel(nullIfBlank(req.heroStatThreeLabel()));
        s.setFeaturedSectionTitle(nullIfBlank(req.featuredSectionTitle()));
        s.setNewArrivalsSectionTitle(nullIfBlank(req.newArrivalsSectionTitle()));
        if (req.maintenanceMode() != null) s.setMaintenanceMode(req.maintenanceMode());
        s.setMaintenanceMessage(nullIfBlank(req.maintenanceMessage()));
        if (req.catalogEnabled() != null) s.setCatalogEnabled(req.catalogEnabled());
        if (req.whatsappEnabled() != null) s.setWhatsappEnabled(req.whatsappEnabled());
    }

    // ─── Auth helpers ─────────────────────────────────────────────────────────

    private void requireAdminAccess() {
        if (SecurityUtils.getCurrentUser().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida");
        }
    }

    private void requireOwnerAccess() {
        User user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida"));
        if (user.getRole().getLevel() < Role.OWNER.getLevel()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requiere rol OWNER o superior");
        }
    }

    private java.util.UUID currentUserId() {
        return SecurityUtils.getCurrentUser().map(User::getId).orElse(null);
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
