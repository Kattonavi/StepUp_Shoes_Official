package com.stepup.settings.dto;

import com.stepup.common.validation.SafeUrl;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateStoreSettingsRequest(

        @NotBlank(message = "El nombre de la tienda es obligatorio")
        @Size(max = 255)
        String storeName,

        @Size(max = 500)
        String storeSlogan,

        @SafeUrl
        @Size(max = 1000)
        String logoUrl,

        @SafeUrl
        @Size(max = 1000)
        String faviconUrl,

        @Size(max = 50)
        String whatsappNumber,

        @Size(max = 500)
        String whatsappDefaultMessage,

        @Email(message = "El email de contacto no tiene formato válido")
        @Size(max = 255)
        String contactEmail,

        @Size(max = 50)
        String contactPhone,

        @Size(max = 500)
        String address,

        @Size(max = 100)
        String city,

        @Size(max = 100)
        String country,

        @SafeUrl
        @Size(max = 1000)
        String instagramUrl,

        @SafeUrl
        @Size(max = 1000)
        String facebookUrl,

        @SafeUrl
        @Size(max = 1000)
        String tiktokUrl,

        @SafeUrl
        @Size(max = 1000)
        String youtubeUrl,

        @Size(max = 255)
        String seoTitle,

        @Size(max = 500)
        String seoDescription,

        @Size(max = 500)
        String seoKeywords,

        @SafeUrl
        @Size(max = 1000)
        String ogImageUrl,

        @Size(max = 255)
        String heroTitle,

        @Size(max = 500)
        String heroSubtitle,

        @Size(max = 100)
        String heroCtaText,

        @SafeUrl
        @Size(max = 500)
        String heroCtaUrl,

        @Size(max = 80)
        String heroEyebrowText,

        @Size(max = 80)
        String heroBadgeText,

        @Size(max = 60)
        String heroSecondaryCtaText,

        @Size(max = 40)
        String heroStatOneValue,

        @Size(max = 100)
        String heroStatOneLabel,

        @Size(max = 40)
        String heroStatTwoValue,

        @Size(max = 100)
        String heroStatTwoLabel,

        @Size(max = 40)
        String heroStatThreeValue,

        @Size(max = 100)
        String heroStatThreeLabel,

        @Size(max = 255)
        String featuredSectionTitle,

        @Size(max = 255)
        String newArrivalsSectionTitle,

        Boolean maintenanceMode,

        @Size(max = 500)
        String maintenanceMessage,

        Boolean catalogEnabled,

        Boolean whatsappEnabled
) {
}
