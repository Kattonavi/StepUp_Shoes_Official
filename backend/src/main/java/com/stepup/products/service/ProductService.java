package com.stepup.products.service;

import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.categories.entity.Category;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.common.exception.BadRequestException;
import com.stepup.common.exception.DuplicateSlugException;
import com.stepup.common.exception.InvalidProductStateException;
import com.stepup.common.exception.ResourceNotFoundException;
import com.stepup.common.service.SlugService;
import com.stepup.products.dto.CreateProductRequest;
import com.stepup.products.dto.ProductImageRequest;
import com.stepup.products.dto.ProductResponse;
import com.stepup.products.dto.ProductSizeRequest;
import com.stepup.products.dto.ProductSummaryResponse;
import com.stepup.products.dto.UpdateProductRequest;
import com.stepup.products.dto.UpdateProductStockRequest;
import com.stepup.products.dto.UpdateProductStatusRequest;
import com.stepup.products.dto.UpdateProductVisibilityRequest;
import com.stepup.products.entity.Product;
import com.stepup.products.entity.ProductImage;
import com.stepup.products.entity.ProductSize;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import com.stepup.products.mapper.ProductMapper;
import com.stepup.products.repository.ProductRepository;
import com.stepup.products.repository.ProductSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.SequencedSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SlugService slugService;
    private final AuditLogService auditLogService;
    private final EntitySerializationService serializer;

    // ─── Public catalog ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> listPublic(
            String categorySlug, String search,
            BigDecimal minPrice, BigDecimal maxPrice,
            StockStatus stockStatus, Boolean isNew, Boolean isOnSale, Boolean isFeatured,
            String sort, Pageable pageable) {

        Pageable sortedPageable = applySort(sort, pageable);
        return productRepository.findAll(
                ProductSpecification.publicCatalog(categorySlug, search, minPrice, maxPrice,
                        stockStatus, isNew, isOnSale, isFeatured),
                sortedPageable
        ).map(ProductMapper::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getPublicById(UUID id) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        if (!product.isPubliclyVisible()) {
            throw new ResourceNotFoundException("Product", id);
        }
        return ProductMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + slug));
        if (!product.isPubliclyVisible()) {
            throw new ResourceNotFoundException("Product not found: " + slug);
        }
        return ProductMapper.toResponse(product);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> listAdmin(boolean includeDeleted, Pageable pageable) {
        return productRepository.findAll(
                ProductSpecification.adminCatalog(includeDeleted), pageable
        ).map(ProductMapper::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getAdminById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return ProductMapper.toResponse(product);
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Category category = requireActiveCategory(request.categoryId());

        String slug = resolveSlugForCreate(request.slug(), request.name());

        BigDecimal discount = computeDiscount(request.price(), request.oldPrice());
        boolean onSale = discount != null && discount.compareTo(BigDecimal.ZERO) > 0;

        Product product = Product.builder()
                .name(request.name()).slug(slug).description(request.description())
                .category(category).price(request.price()).oldPrice(request.oldPrice())
                .discountPercentage(discount)
                .status(request.status() != null ? request.status() : ProductStatus.DRAFT)
                .stockStatus(request.stockStatus() != null ? request.stockStatus() : StockStatus.AVAILABLE)
                .isNew(request.isNew() != null ? request.isNew() : false)
                .isOnSale(onSale)
                .isFeatured(request.isFeatured() != null ? request.isFeatured() : false)
                .visible(request.visible() != null ? request.visible() : true)
                .seoTitle(request.seoTitle()).seoDescription(request.seoDescription())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .images(new ArrayList<>()).sizes(new ArrayList<>())
                .build();

        Product saved = productRepository.save(product);
        if (request.images() != null && !request.images().isEmpty()) addImages(saved, request.images());
        if (request.sizes() != null && !request.sizes().isEmpty())   addSizes(saved, request.sizes());
        Product refreshed = productRepository.save(saved);

        auditLogService.log(AuditAction.CREATE, AuditableEntityType.PRODUCT, refreshed.getId(),
                "Product '" + refreshed.getName() + "' created",
                null, serializer.serializeProductToJson(refreshed));

        log.info("Product created: id={}, slug={}", refreshed.getId(), refreshed.getSlug());
        return ProductMapper.toResponse(refreshed);
    }

    @Transactional
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        if (product.getStatus() == ProductStatus.DELETED) {
            throw new InvalidProductStateException("Cannot update a deleted product");
        }

        String beforeJson = serializer.serializeProductToJson(product);

        Category category = requireActiveCategory(request.categoryId());

        BigDecimal discount = computeDiscount(request.price(), request.oldPrice());
        boolean onSale = discount != null && discount.compareTo(BigDecimal.ZERO) > 0;

        String slug = resolveSlugForUpdate(request.slug(), request.name(), id);
        product.setName(request.name()); product.setSlug(slug);
        product.setDescription(request.description()); product.setCategory(category);
        product.setPrice(request.price()); product.setOldPrice(request.oldPrice());
        product.setDiscountPercentage(discount);
        if (request.status() != null && request.status() != ProductStatus.DELETED)
            product.setStatus(request.status());
        if (request.stockStatus() != null) product.setStockStatus(request.stockStatus());
        if (request.isNew() != null)       product.setIsNew(request.isNew());
        product.setIsOnSale(onSale);
        if (request.isFeatured() != null)  product.setIsFeatured(request.isFeatured());
        if (request.visible() != null)     product.setVisible(request.visible());
        if (request.seoTitle() != null)    product.setSeoTitle(request.seoTitle());
        if (request.seoDescription() != null) product.setSeoDescription(request.seoDescription());
        if (request.displayOrder() != null)   product.setDisplayOrder(request.displayOrder());

        if (request.images() != null) { product.getImages().clear(); addImages(product, request.images()); }
        if (request.sizes() != null)  { product.getSizes().clear();  addSizes(product, request.sizes()); }

        Product saved = productRepository.save(product);
        auditLogService.log(AuditAction.UPDATE, AuditableEntityType.PRODUCT, saved.getId(),
                "Product '" + saved.getName() + "' updated",
                beforeJson, serializer.serializeProductToJson(saved));

        log.info("Product updated: id={}", saved.getId());
        return ProductMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse updateVisibility(UUID id, UpdateProductVisibilityRequest request) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        if (product.getStatus() == ProductStatus.DELETED) {
            throw new InvalidProductStateException("Cannot change visibility of a deleted product");
        }
        String beforeJson = serializer.serializeProductToJson(product);
        product.setVisible(request.visible());
        Product saved = productRepository.save(product);
        auditLogService.log(AuditAction.VISIBILITY_CHANGE, AuditableEntityType.PRODUCT, id,
                "Product visibility changed to " + request.visible(),
                beforeJson, serializer.serializeProductToJson(saved));
        return ProductMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse updateStock(UUID id, UpdateProductStockRequest request) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        if (product.getStatus() == ProductStatus.DELETED) {
            throw new InvalidProductStateException("Cannot change stock of a deleted product");
        }
        String beforeJson = serializer.serializeProductToJson(product);
        product.setStockStatus(request.stockStatus());
        if (request.sizes() != null && !request.sizes().isEmpty()) {
            product.getSizes().clear();
            addSizes(product, request.sizes());
        }
        Product saved = productRepository.save(product);
        auditLogService.log(AuditAction.STOCK_CHANGE, AuditableEntityType.PRODUCT, id,
                "Stock status changed to " + request.stockStatus(),
                beforeJson, serializer.serializeProductToJson(saved));
        return ProductMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse updateStatus(UUID id, UpdateProductStatusRequest request) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        if (request.status() == ProductStatus.DELETED) {
            throw new BadRequestException("Use DELETE endpoint to mark a product as deleted");
        }
        String beforeJson = serializer.serializeProductToJson(product);
        product.setStatus(request.status());
        Product saved = productRepository.save(product);
        auditLogService.log(AuditAction.STATUS_CHANGE, AuditableEntityType.PRODUCT, id,
                "Product status changed to " + request.status(),
                beforeJson, serializer.serializeProductToJson(saved));
        return ProductMapper.toResponse(saved);
    }

    @Transactional
    public void delete(UUID id, UUID deletedBy) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        String beforeJson = serializer.serializeProductToJson(product);
        product.setStatus(ProductStatus.DELETED);
        product.setVisible(false);
        product.setDeletedAt(Instant.now());
        product.setDeletedBy(deletedBy);
        Product saved = productRepository.save(product);
        auditLogService.log(AuditAction.SOFT_DELETE, AuditableEntityType.PRODUCT, id,
                "Product '" + saved.getName() + "' soft-deleted",
                beforeJson, serializer.serializeProductToJson(saved));
        log.info("Product soft-deleted: id={}, deletedBy={}", id, deletedBy);
    }

    @Transactional
    public ProductResponse restore(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        if (!product.isDeleted()) {
            throw new IllegalStateException("Product is not deleted");
        }
        String beforeJson = serializer.serializeProductToJson(product);
        product.setDeletedAt(null);
        product.setDeletedBy(null);
        product.setStatus(ProductStatus.DRAFT);
        product.setVisible(false);
        Product saved = productRepository.save(product);
        auditLogService.log(AuditAction.RESTORE, AuditableEntityType.PRODUCT, id,
                "Product '" + saved.getName() + "' restored (quick restore)",
                beforeJson, serializer.serializeProductToJson(saved));
        log.info("Product restored: id={}", id);
        return ProductMapper.toResponse(saved);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Category requireActiveCategory(UUID categoryId) {
        return categoryRepository.findByIdAndDeletedAtIsNull(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
    }

    private static BigDecimal computeDiscount(BigDecimal price, BigDecimal oldPrice) {
        if (oldPrice == null || oldPrice.compareTo(BigDecimal.ZERO) <= 0) return null;
        if (price == null || price.compareTo(oldPrice) >= 0) return null;
        BigDecimal ratio = oldPrice.subtract(price).divide(oldPrice, 4, RoundingMode.HALF_UP);
        return ratio.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP).stripTrailingZeros();
    }

    private void addImages(Product product, List<ProductImageRequest> imageRequests) {
        boolean hasMain = imageRequests.stream().anyMatch(r -> Boolean.TRUE.equals(r.mainImage()));
        for (int i = 0; i < imageRequests.size(); i++) {
            ProductImageRequest req = imageRequests.get(i);
            boolean isMain = Boolean.TRUE.equals(req.mainImage()) || (!hasMain && i == 0);
            product.getImages().add(ProductImage.builder()
                    .product(product).url(req.url()).altText(req.altText())
                    .position(req.position() != null ? req.position() : i).mainImage(isMain)
                    .build());
        }
    }

    private void addSizes(Product product, List<ProductSizeRequest> sizeRequests) {
        SequencedSet<String> seen = new LinkedHashSet<>();
        for (ProductSizeRequest req : sizeRequests) {
            String normalized = req.size().trim().toUpperCase();
            if (normalized.isEmpty() || !seen.add(normalized)) continue;
            int qty = req.stockQuantity() != null ? req.stockQuantity() : 1;
            product.getSizes().add(ProductSize.builder()
                    .product(product).size(normalized).stockQuantity(qty)
                    .available(req.available() != null ? req.available() : true)
                    .build());
        }
    }

    private Pageable applySort(String sort, Pageable pageable) {
        Sort s = switch (sort != null ? sort : "") {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "name_asc"   -> Sort.by("name").ascending();
            case "featured"   -> Sort.by(Sort.Order.desc("isFeatured"), Sort.Order.asc("displayOrder"));
            default           -> Sort.by("createdAt").descending();
        };
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), s);
    }

    private String resolveSlugForCreate(String requestedSlug, String name) {
        if (requestedSlug != null && !requestedSlug.isBlank()) {
            String clean = slugService.slugify(requestedSlug);
            if (productRepository.existsBySlug(clean)) throw new DuplicateSlugException(clean);
            return clean;
        }
        return slugService.generateUniqueSlug(name, productRepository::existsBySlug);
    }

    private String resolveSlugForUpdate(String requestedSlug, String name, UUID currentId) {
        if (requestedSlug != null && !requestedSlug.isBlank()) {
            String clean = slugService.slugify(requestedSlug);
            if (productRepository.existsBySlugAndIdNot(clean, currentId)) throw new DuplicateSlugException(clean);
            return clean;
        }
        return slugService.generateUniqueSlugExcluding(name, currentId,
                (slug, id) -> productRepository.existsBySlugAndIdNot(slug, (UUID) id));
    }
}
