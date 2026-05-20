package com.stepup.categories.service;

import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.categories.dto.CategoryResponse;
import com.stepup.categories.dto.CreateCategoryRequest;
import com.stepup.categories.dto.UpdateCategoryRequest;
import com.stepup.categories.dto.UpdateCategoryStatusRequest;
import com.stepup.categories.entity.Category;
import com.stepup.categories.mapper.CategoryMapper;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.common.exception.CategoryInUseException;
import com.stepup.common.exception.DuplicateSlugException;
import com.stepup.common.exception.ResourceNotFoundException;
import com.stepup.common.service.SlugService;
import com.stepup.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SlugService slugService;
    private final AuditLogService auditLogService;
    private final EntitySerializationService serializer;

    @Transactional(readOnly = true)
    public Page<CategoryResponse> listPublic(Pageable pageable) {
        return categoryRepository.findAllByDeletedAtIsNullAndActiveTrue(pageable)
                .map(CategoryMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> listAdmin(boolean includeDeleted, Pageable pageable) {
        if (includeDeleted) {
            return categoryRepository.findAll(pageable).map(CategoryMapper::toResponse);
        }
        return categoryRepository.findAllByDeletedAtIsNull(pageable).map(CategoryMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getById(UUID id) {
        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return CategoryMapper.toResponse(category);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getBySlug(String slug) {
        Category category = categoryRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + slug));
        return CategoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        String slug = resolveSlugForCreate(request.slug(), request.name());

        Category category = Category.builder()
                .name(request.name()).slug(slug).icon(request.icon())
                .description(request.description())
                .position(request.position() != null ? request.position() : 0)
                .active(request.active() != null ? request.active() : true)
                .build();

        Category saved = categoryRepository.save(category);
        auditLogService.log(AuditAction.CREATE, AuditableEntityType.CATEGORY, saved.getId(),
                "Category '" + saved.getName() + "' created",
                null, serializer.serializeCategoryToJson(saved));
        log.info("Category created: id={}, slug={}", saved.getId(), saved.getSlug());
        return CategoryMapper.toResponse(saved);
    }

    @Transactional
    public CategoryResponse update(UUID id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        String beforeJson = serializer.serializeCategoryToJson(category);
        String slug = resolveSlugForUpdate(request.slug(), request.name(), id);

        category.setName(request.name()); category.setSlug(slug);
        category.setIcon(request.icon()); category.setDescription(request.description());
        if (request.position() != null) category.setPosition(request.position());

        Category saved = categoryRepository.save(category);
        auditLogService.log(AuditAction.UPDATE, AuditableEntityType.CATEGORY, saved.getId(),
                "Category '" + saved.getName() + "' updated",
                beforeJson, serializer.serializeCategoryToJson(saved));
        log.info("Category updated: id={}, slug={}", saved.getId(), saved.getSlug());
        return CategoryMapper.toResponse(saved);
    }

    @Transactional
    public CategoryResponse updateStatus(UUID id, UpdateCategoryStatusRequest request) {
        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        String beforeJson = serializer.serializeCategoryToJson(category);
        category.setActive(request.active());
        Category saved = categoryRepository.save(category);
        auditLogService.log(AuditAction.STATUS_CHANGE, AuditableEntityType.CATEGORY, id,
                "Category active changed to " + request.active(),
                beforeJson, serializer.serializeCategoryToJson(saved));
        return CategoryMapper.toResponse(saved);
    }

    /**
     * Soft delete. Strategy A: rejects if the category has any non-deleted products.
     */
    @Transactional
    public void delete(UUID id, UUID deletedBy) {
        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (productRepository.existsActiveByCategoryId(id)) {
            throw new CategoryInUseException(
                    "Category '" + category.getName() + "' has active products. " +
                    "Delete or reassign all products before removing this category.");
        }

        String beforeJson = serializer.serializeCategoryToJson(category);
        category.setDeletedAt(Instant.now());
        category.setDeletedBy(deletedBy);
        category.setActive(false);
        Category saved = categoryRepository.save(category);
        auditLogService.log(AuditAction.SOFT_DELETE, AuditableEntityType.CATEGORY, id,
                "Category '" + saved.getName() + "' soft-deleted",
                beforeJson, serializer.serializeCategoryToJson(saved));
        log.info("Category soft-deleted: id={}, deletedBy={}", id, deletedBy);
    }

    @Transactional
    public CategoryResponse restore(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (!category.isDeleted()) {
            throw new IllegalStateException("Category is not deleted");
        }
        String beforeJson = serializer.serializeCategoryToJson(category);
        category.setDeletedAt(null);
        category.setDeletedBy(null);
        category.setActive(false);
        Category saved = categoryRepository.save(category);
        auditLogService.log(AuditAction.RESTORE, AuditableEntityType.CATEGORY, id,
                "Category '" + saved.getName() + "' restored (quick restore)",
                beforeJson, serializer.serializeCategoryToJson(saved));
        log.info("Category restored: id={}", id);
        return CategoryMapper.toResponse(saved);
    }

    // ─── Slug helpers ─────────────────────────────────────────────────────────

    private String resolveSlugForCreate(String requestedSlug, String name) {
        if (requestedSlug != null && !requestedSlug.isBlank()) {
            String clean = slugService.slugify(requestedSlug);
            if (categoryRepository.existsBySlug(clean)) throw new DuplicateSlugException(clean);
            return clean;
        }
        return slugService.generateUniqueSlug(name, categoryRepository::existsBySlug);
    }

    private String resolveSlugForUpdate(String requestedSlug, String name, UUID currentId) {
        if (requestedSlug != null && !requestedSlug.isBlank()) {
            String clean = slugService.slugify(requestedSlug);
            if (categoryRepository.existsBySlugAndIdNot(clean, currentId)) throw new DuplicateSlugException(clean);
            return clean;
        }
        return slugService.generateUniqueSlugExcluding(name, currentId,
                (slug, id) -> categoryRepository.existsBySlugAndIdNot(slug, (UUID) id));
    }
}
