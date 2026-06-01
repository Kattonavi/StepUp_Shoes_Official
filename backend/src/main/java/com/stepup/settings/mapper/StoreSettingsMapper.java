package com.stepup.settings.mapper;

import com.stepup.settings.dto.PublicStoreSettingsResponse;
import com.stepup.settings.dto.StoreSettingsResponse;
import com.stepup.settings.entity.StoreSettings;
import org.springframework.stereotype.Component;

@Component
public class StoreSettingsMapper {

    public PublicStoreSettingsResponse toPublicResponse(StoreSettings s) {
        return new PublicStoreSettingsResponse(
                s.getStoreName(),
                s.getStoreSlogan(),
                s.getLogoUrl(),
                s.getFaviconUrl(),
                s.getWhatsappNumber(),
                s.getWhatsappDefaultMessage(),
                s.getContactEmail(),
                s.getContactPhone(),
                s.getAddress(),
                s.getCity(),
                s.getCountry(),
                s.getInstagramUrl(),
                s.getFacebookUrl(),
                s.getTiktokUrl(),
                s.getYoutubeUrl(),
                s.getSeoTitle(),
                s.getSeoDescription(),
                s.getOgImageUrl(),
                s.getHeroTitle(),
                s.getHeroSubtitle(),
                s.getHeroCtaText(),
                s.getHeroCtaUrl(),
                s.getHeroEyebrowText(),
                s.getHeroBadgeText(),
                s.getHeroSecondaryCtaText(),
                s.getHeroStatOneValue(),
                s.getHeroStatOneLabel(),
                s.getHeroStatTwoValue(),
                s.getHeroStatTwoLabel(),
                s.getHeroStatThreeValue(),
                s.getHeroStatThreeLabel(),
                s.getFeaturedSectionTitle(),
                s.getNewArrivalsSectionTitle(),
                s.getMaintenanceMode(),
                s.getMaintenanceMessage(),
                s.getCatalogEnabled(),
                s.getWhatsappEnabled()
        );
    }

    public StoreSettingsResponse toAdminResponse(StoreSettings s) {
        return new StoreSettingsResponse(
                s.getId(),
                s.getStoreName(),
                s.getStoreSlogan(),
                s.getLogoUrl(),
                s.getFaviconUrl(),
                s.getWhatsappNumber(),
                s.getWhatsappDefaultMessage(),
                s.getContactEmail(),
                s.getContactPhone(),
                s.getAddress(),
                s.getCity(),
                s.getCountry(),
                s.getInstagramUrl(),
                s.getFacebookUrl(),
                s.getTiktokUrl(),
                s.getYoutubeUrl(),
                s.getSeoTitle(),
                s.getSeoDescription(),
                s.getSeoKeywords(),
                s.getOgImageUrl(),
                s.getHeroTitle(),
                s.getHeroSubtitle(),
                s.getHeroCtaText(),
                s.getHeroCtaUrl(),
                s.getHeroEyebrowText(),
                s.getHeroBadgeText(),
                s.getHeroSecondaryCtaText(),
                s.getHeroStatOneValue(),
                s.getHeroStatOneLabel(),
                s.getHeroStatTwoValue(),
                s.getHeroStatTwoLabel(),
                s.getHeroStatThreeValue(),
                s.getHeroStatThreeLabel(),
                s.getFeaturedSectionTitle(),
                s.getNewArrivalsSectionTitle(),
                s.getMaintenanceMode(),
                s.getMaintenanceMessage(),
                s.getCatalogEnabled(),
                s.getWhatsappEnabled(),
                s.getCreatedAt(),
                s.getUpdatedAt(),
                s.getUpdatedBy()
        );
    }
}
