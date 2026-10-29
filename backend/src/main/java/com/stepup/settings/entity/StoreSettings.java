package com.stepup.settings.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "store_settings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @Column(name = "singleton_key", nullable = false, unique = true, length = 10)
    @Builder.Default
    private String singletonKey = "GLOBAL";

    // Identidad
    @Column(name = "store_name", nullable = false, length = 255)
    @Builder.Default
    private String storeName = "Nómada";

    @Column(name = "store_slogan", length = 500)
    private String storeSlogan;

    @Column(name = "logo_url", length = 1000)
    private String logoUrl;

    @Column(name = "favicon_url", length = 1000)
    private String faviconUrl;

    // Contacto
    @Column(name = "whatsapp_number", length = 50)
    private String whatsappNumber;

    @Column(name = "whatsapp_default_message", length = 500)
    private String whatsappDefaultMessage;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "country", length = 100)
    private String country;

    // Redes sociales
    @Column(name = "instagram_url", length = 1000)
    private String instagramUrl;

    @Column(name = "facebook_url", length = 1000)
    private String facebookUrl;

    @Column(name = "tiktok_url", length = 1000)
    private String tiktokUrl;

    @Column(name = "youtube_url", length = 1000)
    private String youtubeUrl;

    // SEO
    @Column(name = "seo_title", length = 255)
    private String seoTitle;

    @Column(name = "seo_description", length = 500)
    private String seoDescription;

    @Column(name = "seo_keywords", length = 500)
    private String seoKeywords;

    @Column(name = "og_image_url", length = 1000)
    private String ogImageUrl;

    // Home
    @Column(name = "hero_title", length = 255)
    private String heroTitle;

    @Column(name = "hero_subtitle", length = 500)
    private String heroSubtitle;

    @Column(name = "hero_cta_text", length = 100)
    private String heroCtaText;

    @Column(name = "hero_cta_url", length = 500)
    private String heroCtaUrl;

    // Hero — textos adicionales editables
    @Column(name = "hero_eyebrow_text", length = 80)
    private String heroEyebrowText;

    @Column(name = "hero_badge_text", length = 80)
    private String heroBadgeText;

    @Column(name = "hero_secondary_cta_text", length = 60)
    private String heroSecondaryCtaText;

    @Column(name = "hero_stat_one_value", length = 40)
    private String heroStatOneValue;

    @Column(name = "hero_stat_one_label", length = 100)
    private String heroStatOneLabel;

    @Column(name = "hero_stat_two_value", length = 40)
    private String heroStatTwoValue;

    @Column(name = "hero_stat_two_label", length = 100)
    private String heroStatTwoLabel;

    @Column(name = "hero_stat_three_value", length = 40)
    private String heroStatThreeValue;

    @Column(name = "hero_stat_three_label", length = 100)
    private String heroStatThreeLabel;

    @Column(name = "featured_section_title", length = 255)
    private String featuredSectionTitle;

    @Column(name = "new_arrivals_section_title", length = 255)
    private String newArrivalsSectionTitle;

    // Operación
    @Column(name = "maintenance_mode", nullable = false)
    @Builder.Default
    private Boolean maintenanceMode = false;

    @Column(name = "maintenance_message", length = 500)
    private String maintenanceMessage;

    @Column(name = "catalog_enabled", nullable = false)
    @Builder.Default
    private Boolean catalogEnabled = true;

    @Column(name = "whatsapp_enabled", nullable = false)
    @Builder.Default
    private Boolean whatsappEnabled = true;

    // Auditoría
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "updated_by", columnDefinition = "uuid")
    private UUID updatedBy;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
