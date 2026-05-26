package com.stepup.promotions.entity;

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
@Table(name = "promotions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "subtitle", length = 500)
    private String subtitle;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "link_url", length = 1000)
    private String linkUrl;

    @Column(name = "link_label", length = 100)
    private String linkLabel;

    @Column(name = "badge_text", length = 50)
    private String badgeText;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    /**
     * Controla si la promoción aparece en la home pública. Es independiente de
     * {@link #active}: una promoción puede estar activa (campaña habilitada)
     * pero oculta del home, o visible pero pausada. Para mostrarse en home se
     * requiere {@code active && visible && dentro de fechas && !deleted}.
     */
    @Builder.Default
    @Column(name = "visible", nullable = false)
    private Boolean visible = true;

    @Builder.Default
    @Column(name = "position", nullable = false)
    private Integer position = 0;

    /** Cloudinary public_id de la imagen, si fue subida por el admin. NULL si la imageUrl es manual. */
    @Column(name = "cloudinary_public_id", length = 255)
    private String cloudinaryPublicId;

    @Column(name = "starts_at")
    private Instant startsAt;

    @Column(name = "ends_at")
    private Instant endsAt;

    @Column(name = "created_by", columnDefinition = "uuid")
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by", columnDefinition = "uuid")
    private UUID deletedBy;

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

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public boolean isCurrentlyActive() {
        if (!Boolean.TRUE.equals(active) || isDeleted()) return false;
        Instant now = Instant.now();
        if (startsAt != null && now.isBefore(startsAt)) return false;
        if (endsAt != null && now.isAfter(endsAt)) return false;
        return true;
    }

    /** True iff the promo qualifies to be rendered on the public home. */
    public boolean isPubliclyVisible() {
        return Boolean.TRUE.equals(visible) && isCurrentlyActive();
    }
}
