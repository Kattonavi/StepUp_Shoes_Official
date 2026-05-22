package com.stepup.promotions.service;

import com.stepup.common.exception.ResourceNotFoundException;
import com.stepup.promotions.dto.CreatePromotionRequest;
import com.stepup.promotions.dto.PromotionResponse;
import com.stepup.promotions.dto.UpdatePromotionRequest;
import com.stepup.promotions.entity.Promotion;
import com.stepup.promotions.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

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
        Promotion promo = Promotion.builder()
                .title(req.title())
                .subtitle(req.subtitle())
                .imageUrl(req.imageUrl())
                .linkUrl(req.linkUrl())
                .linkLabel(req.linkLabel())
                .badgeText(req.badgeText())
                .active(req.active() != null ? req.active() : true)
                .position(req.position() != null ? req.position() : 0)
                .startsAt(req.startsAt())
                .endsAt(req.endsAt())
                .createdBy(actorId)
                .build();
        return toResponse(promotionRepository.save(promo));
    }

    @Transactional
    public PromotionResponse update(UUID id, UpdatePromotionRequest req) {
        Promotion promo = requireById(id);
        promo.setTitle(req.title());
        promo.setSubtitle(req.subtitle());
        promo.setImageUrl(req.imageUrl());
        promo.setLinkUrl(req.linkUrl());
        promo.setLinkLabel(req.linkLabel());
        promo.setBadgeText(req.badgeText());
        if (req.active() != null) promo.setActive(req.active());
        if (req.position() != null) promo.setPosition(req.position());
        promo.setStartsAt(req.startsAt());
        promo.setEndsAt(req.endsAt());
        return toResponse(promotionRepository.save(promo));
    }

    @Transactional
    public PromotionResponse toggleActive(UUID id, boolean active) {
        Promotion promo = requireById(id);
        promo.setActive(active);
        return toResponse(promotionRepository.save(promo));
    }

    @Transactional
    public void delete(UUID id, UUID actorId) {
        Promotion promo = requireById(id);
        promo.setDeletedAt(Instant.now());
        promo.setDeletedBy(actorId);
        promotionRepository.save(promo);
    }

    private Promotion requireById(UUID id) {
        return promotionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id));
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
                p.getPosition(),
                p.getStartsAt(),
                p.getEndsAt(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                p.getDeletedAt()
        );
    }
}
