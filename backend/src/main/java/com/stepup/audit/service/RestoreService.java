package com.stepup.audit.service;

import com.stepup.audit.entity.EntitySnapshot;
import com.stepup.audit.entity.RestoreAction;
import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.repository.RestoreActionRepository;
import com.stepup.categories.entity.Category;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.common.exception.ResourceNotFoundException;
import com.stepup.common.exception.RestoreNotAllowedException;
import com.stepup.common.exception.UnsupportedRestoreTypeException;
import com.stepup.common.service.SlugService;
import com.stepup.products.entity.Product;
import com.stepup.products.entity.ProductImage;
import com.stepup.products.entity.ProductSize;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import com.stepup.products.repository.ProductRepository;
import com.stepup.users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestoreService {

    private final EntitySnapshotService entitySnapshotService;
    private final AuditLogService auditLogService;
    private final EntitySerializationService serializer;
    private final RestoreActionRepository restoreActionRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SlugService slugService;

    /**
     * Restores an entity from the data stored in the given snapshot.
     * Only PRODUCT and CATEGORY are supported in Phase 3.
     * Creates RestoreAction + AuditLog + AFTER_RESTORE snapshot.
     */
    @Transactional
    public RestoreAction restoreFromSnapshot(UUID snapshotId, String reason, User actor) {
        EntitySnapshot snapshot = entitySnapshotService.getById(snapshotId);

        String dataToRestore = chooseRestoreData(snapshot);
        if (dataToRestore == null) {
            throw new RestoreNotAllowedException("Snapshot has no restorable data (both beforeData and afterData are null)");
        }

        return switch (snapshot.getEntityType()) {
            case PRODUCT  -> restoreProduct(snapshot, dataToRestore, reason, actor);
            case CATEGORY -> restoreCategory(snapshot, dataToRestore, reason, actor);
            default       -> throw new UnsupportedRestoreTypeException(snapshot.getEntityType());
        };
    }

    // ─── Product restore ──────────────────────────────────────────────────────

    private RestoreAction restoreProduct(EntitySnapshot snapshot, String dataJson, String reason, User actor) {
        UUID entityId = snapshot.getEntityId();
        Product product = productRepository.findById(entityId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", entityId));

        String beforeRestoreJson = serializer.serializeProductToJson(product);
        Map<String, Object> data = serializer.fromJson(dataJson);

        // Validate category exists
        String categoryIdStr = (String) data.get("categoryId");
        if (categoryIdStr == null) {
            throw new RestoreNotAllowedException("Snapshot does not contain a valid categoryId");
        }
        UUID categoryId = UUID.fromString(categoryIdStr);
        Category category = categoryRepository.findByIdAndDeletedAtIsNull(categoryId)
                .orElseThrow(() -> new RestoreNotAllowedException(
                        "Category from snapshot (id=" + categoryId + ") no longer exists or is deleted. " +
                        "Restore the category first."));

        // Apply fields from snapshot
        product.setName(str(data, "name"));
        product.setSlug(str(data, "slug"));
        product.setDescription(str(data, "description"));
        product.setCategory(category);
        product.setPrice(decimal(data, "price"));
        product.setOldPrice(decimal(data, "oldPrice"));
        product.setDiscountPercentage(decimal(data, "discountPercentage"));
        product.setReferenceCode(str(data, "referenceCode"));
        // Safety: restored products are always DRAFT + invisible unless snapshot said ACTIVE
        ProductStatus snapshotStatus = parseEnum(data, "status", ProductStatus.class);
        product.setStatus(snapshotStatus == ProductStatus.ACTIVE ? ProductStatus.DRAFT : snapshotStatus != null ? snapshotStatus : ProductStatus.DRAFT);
        product.setVisible(false);
        product.setStockStatus(parseEnum(data, "stockStatus", StockStatus.class, StockStatus.AVAILABLE));
        product.setIsNew(bool(data, "isNew", false));
        product.setIsOnSale(bool(data, "isOnSale", false));
        product.setIsFeatured(bool(data, "isFeatured", false));
        product.setSeoTitle(str(data, "seoTitle"));
        product.setSeoDescription(str(data, "seoDescription"));
        product.setDisplayOrder(integer(data, "displayOrder", 0));
        // Clear soft-delete markers
        product.setDeletedAt(null);
        product.setDeletedBy(null);

        // Restore images
        product.getImages().clear();
        restoreProductImages(product, data);

        // Restore sizes
        product.getSizes().clear();
        restoreProductSizes(product, data);

        Product saved = productRepository.save(product);
        String afterRestoreJson = serializer.serializeProductToJson(saved);

        log.info("Product restored from snapshot: productId={}, snapshotId={}, actor={}",
                entityId, snapshot.getId(), actor.getEmail());

        return createRestoreRecord(snapshot, actor, AuditableEntityType.PRODUCT,
                entityId, reason, beforeRestoreJson, afterRestoreJson);
    }

    @SuppressWarnings("unchecked")
    private void restoreProductImages(Product product, Map<String, Object> data) {
        Object imagesRaw = data.get("images");
        if (imagesRaw instanceof List<?> imageList) {
            for (int i = 0; i < imageList.size(); i++) {
                Map<String, Object> img = (Map<String, Object>) imageList.get(i);
                ProductImage image = ProductImage.builder()
                        .product(product)
                        .url(str(img, "url"))
                        .altText(str(img, "altText"))
                        .position(integer(img, "position", i))
                        .mainImage(bool(img, "mainImage", i == 0))
                        .build();
                product.getImages().add(image);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private void restoreProductSizes(Product product, Map<String, Object> data) {
        Object sizesRaw = data.get("sizes");
        if (sizesRaw instanceof List<?> sizeList) {
            for (Object sizeRaw : sizeList) {
                Map<String, Object> sz = (Map<String, Object>) sizeRaw;
                int qty = integer(sz, "stockQuantity", 0);
                ProductSize size = ProductSize.builder()
                        .product(product)
                        .size(str(sz, "size"))
                        .stockQuantity(qty)
                        .available(bool(sz, "available", qty > 0))
                        .build();
                product.getSizes().add(size);
            }
        }
    }

    // ─── Category restore ─────────────────────────────────────────────────────

    private RestoreAction restoreCategory(EntitySnapshot snapshot, String dataJson, String reason, User actor) {
        UUID entityId = snapshot.getEntityId();
        Category category = categoryRepository.findById(entityId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", entityId));

        String beforeRestoreJson = serializer.serializeCategoryToJson(category);
        Map<String, Object> data = serializer.fromJson(dataJson);

        // Restore fields
        category.setName(str(data, "name"));
        category.setIcon(str(data, "icon"));
        category.setDescription(str(data, "description"));
        category.setPosition(integer(data, "position", 0));
        // Safety: restored categories are inactive — admin must re-activate
        category.setActive(false);
        // Clear soft-delete markers
        category.setDeletedAt(null);
        category.setDeletedBy(null);

        // Slug: try original, generate unique variant if conflict
        String originalSlug = str(data, "slug");
        if (originalSlug != null) {
            boolean slugConflict = categoryRepository.existsBySlugAndIdNot(originalSlug, entityId);
            if (slugConflict) {
                String newSlug = slugService.generateUniqueSlug(originalSlug, categoryRepository::existsBySlug);
                log.warn("Slug conflict on category restore: original='{}', assigned='{}'", originalSlug, newSlug);
                category.setSlug(newSlug);
            } else {
                category.setSlug(originalSlug);
            }
        }

        Category saved = categoryRepository.save(category);
        String afterRestoreJson = serializer.serializeCategoryToJson(saved);

        log.info("Category restored from snapshot: categoryId={}, snapshotId={}, actor={}",
                entityId, snapshot.getId(), actor.getEmail());

        return createRestoreRecord(snapshot, actor, AuditableEntityType.CATEGORY,
                entityId, reason, beforeRestoreJson, afterRestoreJson);
    }

    // ─── Shared helpers ───────────────────────────────────────────────────────

    private RestoreAction createRestoreRecord(EntitySnapshot snapshot,
                                              User actor,
                                              AuditableEntityType entityType,
                                              UUID entityId,
                                              String reason,
                                              String beforeJson,
                                              String afterJson) {
        // Audit log for the restore
        auditLogService.log(AuditAction.RESTORE, entityType, entityId,
                "Entity restored from snapshot " + snapshot.getId() + " by " + actor.getEmail(),
                beforeJson, afterJson);

        RestoreAction ra = RestoreAction.builder()
                .snapshot(snapshot)
                .restoredByUserId(actor.getId())
                .restoredByEmail(actor.getEmail())
                .entityType(entityType)
                .entityId(entityId)
                .reason(reason)
                .beforeRestoreData(beforeJson)
                .afterRestoreData(afterJson)
                .build();

        return restoreActionRepository.save(ra);
    }

    /**
     * Chooses which data to restore from.
     * For BEFORE_DELETE snapshots: use beforeData (pre-deletion state).
     * For all others: prefer beforeData, fall back to afterData.
     */
    private String chooseRestoreData(EntitySnapshot snapshot) {
        return switch (snapshot.getSnapshotReason()) {
            case BEFORE_DELETE -> snapshot.getBeforeData() != null
                    ? snapshot.getBeforeData() : snapshot.getAfterData();
            default -> snapshot.getBeforeData() != null
                    ? snapshot.getBeforeData() : snapshot.getAfterData();
        };
    }

    // ─── Type conversion helpers ──────────────────────────────────────────────

    private String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }

    private BigDecimal decimal(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v == null) return null;
        try { return new BigDecimal(v.toString()); }
        catch (Exception e) { return null; }
    }

    private Integer integer(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v == null) return null;
        try { return ((Number) v).intValue(); }
        catch (Exception e) { return null; }
    }

    private int integer(Map<String, Object> m, String key, int defaultValue) {
        Integer v = integer(m, key);
        return v != null ? v : defaultValue;
    }

    private boolean bool(Map<String, Object> m, String key, boolean defaultValue) {
        Object v = m.get(key);
        if (v instanceof Boolean b) return b;
        return defaultValue;
    }

    private <E extends Enum<E>> E parseEnum(Map<String, Object> m, String key, Class<E> type) {
        Object v = m.get(key);
        if (v == null) return null;
        try { return Enum.valueOf(type, v.toString()); }
        catch (Exception e) { return null; }
    }

    private <E extends Enum<E>> E parseEnum(Map<String, Object> m, String key, Class<E> type, E fallback) {
        E result = parseEnum(m, key, type);
        return result != null ? result : fallback;
    }
}
