package com.stepup.audit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stepup.categories.entity.Category;
import com.stepup.common.exception.InvalidSnapshotDataException;
import com.stepup.messages.entity.Message;
import com.stepup.promotions.entity.Promotion;
import com.stepup.settings.entity.StoreSettings;
import com.stepup.products.entity.Product;
import com.stepup.products.entity.ProductImage;
import com.stepup.products.entity.ProductSize;
import com.stepup.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Converts JPA entities to safe Map/JSON representations for audit snapshots.
 * Never includes sensitive fields (passwordHash, tokens, secrets).
 * Avoids JPA bidirectional relationship cycles.
 */
@Service
@RequiredArgsConstructor
public class EntitySerializationService {

    private final ObjectMapper objectMapper;

    // ─── Product ─────────────────────────────────────────────────────────────

    public Map<String, Object> serializeProduct(Product p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                 str(p.getId()));
        m.put("name",               p.getName());
        m.put("slug",               p.getSlug());
        m.put("description",        p.getDescription());
        m.put("categoryId",         str(p.getCategory() != null ? p.getCategory().getId() : null));
        m.put("categoryName",       p.getCategory() != null ? p.getCategory().getName() : null);
        m.put("categorySlug",       p.getCategory() != null ? p.getCategory().getSlug() : null);
        m.put("price",              p.getPrice());
        m.put("oldPrice",           p.getOldPrice());
        m.put("discountPercentage", p.getDiscountPercentage());
        m.put("status",             str(p.getStatus()));
        m.put("stockStatus",        str(p.getStockStatus()));
        m.put("isNew",              p.getIsNew());
        m.put("isOnSale",           p.getIsOnSale());
        m.put("isFeatured",         p.getIsFeatured());
        m.put("visible",            p.getVisible());
        m.put("seoTitle",           p.getSeoTitle());
        m.put("seoDescription",     p.getSeoDescription());
        m.put("displayOrder",       p.getDisplayOrder());
        m.put("createdAt",          str(p.getCreatedAt()));
        m.put("updatedAt",          str(p.getUpdatedAt()));
        m.put("deletedAt",          str(p.getDeletedAt()));
        m.put("deletedBy",          str(p.getDeletedBy()));

        if (p.getImages() != null) {
            m.put("images", p.getImages().stream().map(this::serializeProductImage).toList());
        }
        if (p.getSizes() != null) {
            m.put("sizes", p.getSizes().stream().map(this::serializeProductSize).toList());
        }
        return m;
    }

    public String serializeProductToJson(Product p) {
        return toJson(serializeProduct(p));
    }

    private Map<String, Object> serializeProductImage(ProductImage img) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",        str(img.getId()));
        m.put("url",       img.getUrl());
        m.put("altText",   img.getAltText());
        m.put("position",  img.getPosition());
        m.put("mainImage", img.getMainImage());
        return m;
    }

    private Map<String, Object> serializeProductSize(ProductSize s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",            str(s.getId()));
        m.put("size",          s.getSize());
        m.put("stockQuantity", s.getStockQuantity());
        m.put("available",     s.getAvailable());
        return m;
    }

    // ─── Category ────────────────────────────────────────────────────────────

    public Map<String, Object> serializeCategory(Category c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",          str(c.getId()));
        m.put("name",        c.getName());
        m.put("slug",        c.getSlug());
        m.put("icon",        c.getIcon());
        m.put("description", c.getDescription());
        m.put("position",    c.getPosition());
        m.put("active",      c.getActive());
        m.put("createdAt",   str(c.getCreatedAt()));
        m.put("updatedAt",   str(c.getUpdatedAt()));
        m.put("deletedAt",   str(c.getDeletedAt()));
        m.put("deletedBy",   str(c.getDeletedBy()));
        return m;
    }

    public String serializeCategoryToJson(Category c) {
        return toJson(serializeCategory(c));
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    /** NEVER includes passwordHash or refresh tokens. */
    public Map<String, Object> serializeUser(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",          str(u.getId()));
        m.put("email",       u.getEmail());
        m.put("fullName",    u.getFullName());
        m.put("role",        str(u.getRole()));
        m.put("status",      str(u.getStatus()));
        m.put("lastLoginAt", str(u.getLastLoginAt()));
        m.put("blockedAt",   str(u.getBlockedAt()));
        m.put("createdAt",   str(u.getCreatedAt()));
        m.put("updatedAt",   str(u.getUpdatedAt()));
        m.put("deletedAt",   str(u.getDeletedAt()));
        m.put("deletedBy",   str(u.getDeletedBy()));
        // passwordHash intentionally excluded
        return m;
    }

    public String serializeUserToJson(User u) {
        return toJson(serializeUser(u));
    }

    // ─── Message ─────────────────────────────────────────────────────────────

    public Map<String, Object> serializeMessage(Message m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",            str(m.getId()));
        map.put("fullName",      m.getFullName());
        map.put("email",         m.getEmail());
        map.put("phone",         m.getPhone());
        map.put("subject",       m.getSubject());
        map.put("content",       m.getContent());
        map.put("productId",     str(m.getProductId()));
        map.put("productName",   m.getProductName());
        map.put("source",        str(m.getSource()));
        map.put("status",        str(m.getStatus()));
        map.put("internalNotes", m.getInternalNotes());
        map.put("readAt",        str(m.getReadAt()));
        map.put("readBy",        str(m.getReadBy()));
        map.put("archivedAt",    str(m.getArchivedAt()));
        map.put("archivedBy",    str(m.getArchivedBy()));
        map.put("createdAt",     str(m.getCreatedAt()));
        map.put("updatedAt",     str(m.getUpdatedAt()));
        map.put("deletedAt",     str(m.getDeletedAt()));
        map.put("deletedBy",     str(m.getDeletedBy()));
        return map;
    }

    public String serializeMessageToJson(Message m) {
        return toJson(serializeMessage(m));
    }

    // ─── StoreSettings ────────────────────────────────────────────────────────

    public Map<String, Object> serializeStoreSettings(StoreSettings s) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id",                      str(s.getId()));
        map.put("storeName",               s.getStoreName());
        map.put("storeSlogan",             s.getStoreSlogan());
        map.put("logoUrl",                 s.getLogoUrl());
        map.put("whatsappNumber",          s.getWhatsappNumber());
        map.put("contactEmail",            s.getContactEmail());
        map.put("contactPhone",            s.getContactPhone());
        map.put("address",                 s.getAddress());
        map.put("city",                    s.getCity());
        map.put("country",                 s.getCountry());
        map.put("instagramUrl",            s.getInstagramUrl());
        map.put("facebookUrl",             s.getFacebookUrl());
        map.put("tiktokUrl",               s.getTiktokUrl());
        map.put("youtubeUrl",              s.getYoutubeUrl());
        map.put("seoTitle",                s.getSeoTitle());
        map.put("seoDescription",          s.getSeoDescription());
        map.put("heroTitle",               s.getHeroTitle());
        map.put("heroSubtitle",            s.getHeroSubtitle());
        map.put("heroCtaText",             s.getHeroCtaText());
        map.put("heroCtaUrl",              s.getHeroCtaUrl());
        map.put("heroEyebrowText",         s.getHeroEyebrowText());
        map.put("heroBadgeText",           s.getHeroBadgeText());
        map.put("heroSecondaryCtaText",    s.getHeroSecondaryCtaText());
        map.put("heroStatOneValue",        s.getHeroStatOneValue());
        map.put("heroStatOneLabel",        s.getHeroStatOneLabel());
        map.put("heroStatTwoValue",        s.getHeroStatTwoValue());
        map.put("heroStatTwoLabel",        s.getHeroStatTwoLabel());
        map.put("heroStatThreeValue",      s.getHeroStatThreeValue());
        map.put("heroStatThreeLabel",      s.getHeroStatThreeLabel());
        map.put("featuredSectionTitle",    s.getFeaturedSectionTitle());
        map.put("newArrivalsSectionTitle", s.getNewArrivalsSectionTitle());
        map.put("maintenanceMode",         s.getMaintenanceMode());
        map.put("catalogEnabled",          s.getCatalogEnabled());
        map.put("whatsappEnabled",         s.getWhatsappEnabled());
        map.put("updatedAt",               str(s.getUpdatedAt()));
        map.put("updatedBy",               str(s.getUpdatedBy()));
        return map;
    }

    public String serializeStoreSettingsToJson(StoreSettings s) {
        return toJson(serializeStoreSettings(s));
    }

    // ─── Promotion ────────────────────────────────────────────────────────────

    public Map<String, Object> serializePromotion(Promotion p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                 str(p.getId()));
        m.put("title",              p.getTitle());
        m.put("subtitle",           p.getSubtitle());
        m.put("imageUrl",           p.getImageUrl());
        m.put("linkUrl",            p.getLinkUrl());
        m.put("linkLabel",          p.getLinkLabel());
        m.put("badgeText",          p.getBadgeText());
        m.put("active",             p.getActive());
        m.put("visible",            p.getVisible());
        m.put("position",           p.getPosition());
        m.put("startsAt",           str(p.getStartsAt()));
        m.put("endsAt",             str(p.getEndsAt()));
        m.put("cloudinaryPublicId", p.getCloudinaryPublicId());
        m.put("createdAt",          str(p.getCreatedAt()));
        m.put("updatedAt",          str(p.getUpdatedAt()));
        m.put("deletedAt",          str(p.getDeletedAt()));
        m.put("deletedBy",          str(p.getDeletedBy()));
        return m;
    }

    public String serializePromotionToJson(Promotion p) {
        return toJson(serializePromotion(p));
    }

    // ─── JSON helpers ────────────────────────────────────────────────────────

    public String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new InvalidSnapshotDataException("Failed to serialize entity to JSON: " + e.getMessage());
        }
    }

    public Map<String, Object> fromJson(String json) {
        if (json == null || json.isBlank()) {
            throw new InvalidSnapshotDataException("Snapshot data is empty");
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new InvalidSnapshotDataException("Failed to parse snapshot JSON: " + e.getMessage());
        }
    }

    public List<Map<String, Object>> listFromJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            throw new InvalidSnapshotDataException("Failed to parse snapshot list JSON: " + e.getMessage());
        }
    }

    private String str(Object o) {
        return o == null ? null : o.toString();
    }
}
