package com.stepup.promotions.service;

import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.common.exception.BadRequestException;
import com.stepup.common.exception.ResourceNotFoundException;
import com.stepup.promotions.dto.CreatePromotionRequest;
import com.stepup.promotions.dto.PromotionResponse;
import com.stepup.promotions.dto.UpdatePromotionRequest;
import com.stepup.promotions.entity.Promotion;
import com.stepup.promotions.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final AuditLogService auditLogService;
    private final EntitySerializationService serializer;

    @Transactional(readOnly = true)
    public List<PromotionResponse> listAdmin() {
        return promotionRepository.findAllByDeletedAtIsNullOrderByPositionAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> listPublic() {
        return promotionRepository.findAllActiveAndNotExpired(Instant.now())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PromotionResponse getById(UUID id) {
        return toResponse(requireById(id));
    }

    @Transactional
    public PromotionResponse create(CreatePromotionRequest req, UUID actorId) {
        validateDates(req.startsAt(), req.endsAt());

        Promotion promo = Promotion.builder()
                .title(req.title())
                .subtitle(req.subtitle())
                .imageUrl(req.imageUrl())
                .linkUrl(req.linkUrl())
                .linkLabel(req.linkLabel())
                .badgeText(req.badgeText())
                .active(req.active() != null ? req.active() : true)
                .visible(req.visible() != null ? req.visible() : true)
                .position(req.position() != null ? req.position() : 0)
                .startsAt(req.startsAt())
                .endsAt(req.endsAt())
                .cloudinaryPublicId(req.cloudinaryPublicId())
                .createdBy(actorId)
                .build();

        Promotion saved = promotionRepository.save(promo);
        String afterJson = serializer.serializePromotionToJson(saved);
        auditLogService.log(AuditAction.CREATE, AuditableEntityType.PROMOTION, saved.getId(),
                "Promotion created: " + saved.getTitle(), null, afterJson);

        log.info("Promotion created: id={}, title={}", saved.getId(), saved.getTitle());
        return toResponse(saved);
    }

    @Transactional
    public PromotionResponse update(UUID id, UpdatePromotionRequest req) {
        validateDates(req.startsAt(), req.endsAt());

        Promotion promo = requireById(id);
        String beforeJson = serializer.serializePromotionToJson(promo);

        promo.setTitle(req.title());
        promo.setSubtitle(req.subtitle());
        promo.setImageUrl(req.imageUrl());
        promo.setLinkUrl(req.linkUrl());
        promo.setLinkLabel(req.linkLabel());
        promo.setBadgeText(req.badgeText());
        if (req.active() != null) promo.setActive(req.active());
        if (req.visible() != null) promo.setVisible(req.visible());
        if (req.position() != null) promo.setPosition(req.position());
        promo.setStartsAt(req.startsAt());
        promo.setEndsAt(req.endsAt());
        promo.setCloudinaryPublicId(req.cloudinaryPublicId());

        Promotion saved = promotionRepository.save(promo);
        String afterJson = serializer.serializePromotionToJson(saved);
        auditLogService.log(AuditAction.UPDATE, AuditableEntityType.PROMOTION, saved.getId(),
                "Promotion updated: " + saved.getTitle(), beforeJson, afterJson);

        log.info("Promotion updated: id={}", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public PromotionResponse toggleActive(UUID id, boolean active) {
        Promotion promo = requireById(id);
        String beforeJson = serializer.serializePromotionToJson(promo);

        promo.setActive(active);
        Promotion saved = promotionRepository.save(promo);

        String afterJson = serializer.serializePromotionToJson(saved);
        auditLogService.log(AuditAction.STATUS_CHANGE, AuditableEntityType.PROMOTION, saved.getId(),
                "Promotion " + (active ? "activated" : "deactivated") + ": " + saved.getTitle(),
                beforeJson, afterJson);

        log.info("Promotion status changed: id={}, active={}", saved.getId(), active);
        return toResponse(saved);
    }

    /**
     * Flips the {@code visible} flag without touching {@code active}. This is
     * the "show/hide on home" action — the promotion stays in the library and
     * can be re-shown later without recreating it.
     */
    @Transactional
    public PromotionResponse toggleVisible(UUID id, boolean visible) {
        Promotion promo = requireById(id);
        String beforeJson = serializer.serializePromotionToJson(promo);

        promo.setVisible(visible);
        Promotion saved = promotionRepository.save(promo);

        String afterJson = serializer.serializePromotionToJson(saved);
        auditLogService.log(AuditAction.VISIBILITY_CHANGE, AuditableEntityType.PROMOTION, saved.getId(),
                "Promotion " + (visible ? "shown on home" : "hidden from home") + ": " + saved.getTitle(),
                beforeJson, afterJson);

        log.info("Promotion visibility changed: id={}, visible={}", saved.getId(), visible);
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID id, UUID actorId) {
        Promotion promo = requireById(id);
        String beforeJson = serializer.serializePromotionToJson(promo);

        promo.setDeletedAt(Instant.now());
        promo.setDeletedBy(actorId);
        promotionRepository.save(promo);

        auditLogService.log(AuditAction.SOFT_DELETE, AuditableEntityType.PROMOTION, promo.getId(),
                "Promotion deleted: " + promo.getTitle(), beforeJson, null);

        log.info("Promotion soft-deleted: id={}, deletedBy={}", promo.getId(), actorId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Promotion requireById(UUID id) {
        return promotionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));
    }

    private void validateDates(Instant startsAt, Instant endsAt) {
        if (startsAt != null && endsAt != null && !startsAt.isBefore(endsAt)) {
            throw new BadRequestException(
                    "La fecha de inicio debe ser anterior a la fecha de finalización.");
        }
    }

    private PromotionResponse toResponse(Promotion p) {
        return new PromotionResponse(
                p.getId(),
                p.getTitle(),
                p.getSubtitle(),
                p.getImageUrl(),
                p.getLinkUrl(),
                p.getLinkLabel(),
                p.getBadgeText(),
                p.getActive(),
                p.getVisible(),
                p.getPosition(),
                p.getStartsAt(),
                p.getEndsAt(),
                p.getCloudinaryPublicId(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                p.getDeletedAt()
        );
    }
}
