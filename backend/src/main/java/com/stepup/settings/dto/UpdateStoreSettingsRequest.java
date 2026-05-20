package com.stepup.settings.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateStoreSettingsRequest(

        @NotBlank(message = "El nombre de la tienda es obligatorio")
        @Size(max = 255)
        String storeName,

        @Size(max = 500)
        String storeSlogan,

        @Size(max = 1000)
        String logoUrl,

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

        @Size(max = 1000)
        String instagramUrl,

        @Size(max = 1000)
        String facebookUrl,

        @Size(max = 1000)
        String tiktokUrl,

        @Size(max = 1000)
        String youtubeUrl,

        @Size(max = 255)
        String seoTitle,

        @Size(max = 500)
        String seoDescription,

        @Size(max = 500)
        String seoKeywords,

        @Size(max = 1000)
        String ogImageUrl,

        @Size(max = 255)
        String heroTitle,

        @Size(max = 500)
        String heroSubtitle,

        @Size(max = 100)
        String heroCtaText,

        @Size(max = 500)
        String heroCtaUrl,

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
