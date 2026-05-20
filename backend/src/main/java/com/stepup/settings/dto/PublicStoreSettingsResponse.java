package com.stepup.settings.dto;

public record PublicStoreSettingsResponse(
        String storeName,
        String storeSlogan,
        String logoUrl,
        String faviconUrl,
        String whatsappNumber,
        String whatsappDefaultMessage,
        String contactEmail,
        String contactPhone,
        String address,
        String city,
        String country,
        String instagramUrl,
        String facebookUrl,
        String tiktokUrl,
        String youtubeUrl,
        String seoTitle,
        String seoDescription,
        String ogImageUrl,
        String heroTitle,
        String heroSubtitle,
        String heroCtaText,
        String heroCtaUrl,
        String featuredSectionTitle,
        String newArrivalsSectionTitle,
        Boolean maintenanceMode,
        String maintenanceMessage,
        Boolean catalogEnabled,
        Boolean whatsappEnabled
) {
}
