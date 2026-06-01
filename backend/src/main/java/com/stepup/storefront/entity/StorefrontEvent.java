package com.stepup.storefront.entity;

import com.stepup.storefront.enums.StorefrontEventType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "storefront_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private StorefrontEventType eventType;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "product_slug", length = 255)
    private String productSlug;

    @Column(name = "product_name", length = 255)
    private String productName;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "category_slug", length = 255)
    private String categorySlug;

    @Column(name = "category_name", length = 255)
    private String categoryName;

    @Column(name = "promotion_id")
    private UUID promotionId;

    @Column(name = "promotion_title", length = 255)
    private String promotionTitle;

    @Column(name = "selected_size", length = 50)
    private String selectedSize;

    @Column(name = "stock_status", length = 50)
    private String stockStatus;

    @Column(name = "source_page", length = 255)
    private String sourcePage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "user_agent_hash", length = 128)
    private String userAgentHash;

    @Column(name = "session_hash", length = 128)
    private String sessionHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
