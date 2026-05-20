package com.stepup.categories.service;

import com.stepup.categories.dto.CreateCategoryRequest;
import com.stepup.categories.dto.UpdateCategoryStatusRequest;
import com.stepup.categories.entity.Category;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.common.exception.CategoryInUseException;
import com.stepup.common.exception.DuplicateSlugException;
import com.stepup.common.exception.ResourceNotFoundException;
import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.common.service.SlugService;
import com.stepup.products.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Unit Tests")
class CategoryServiceTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private ProductRepository productRepository;
    @Mock private AuditLogService auditLogService;
    @Mock private EntitySerializationService entitySerializationService;

    @InjectMocks
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryService(categoryRepository, productRepository,
                new SlugService(), auditLogService, entitySerializationService);
        // stub serializer to return safe JSON so audit calls don't NPE
        lenient().when(entitySerializationService.serializeCategoryToJson(any())).thenReturn("{}");
    }

    @Test
    @DisplayName("create generates slug from name when slug not provided")
    void create_generatesSlugFromName() {
        var request = new CreateCategoryRequest("Zapatos de Cuero", null, null, null, null, null);
        when(categoryRepository.existsBySlug("zapatos-de-cuero")).thenReturn(false);
        when(categoryRepository.save(any())).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            return c;
        });

        var response = categoryService.create(request);

        assertThat(response.slug()).isEqualTo("zapatos-de-cuero");
    }

    @Test
    @DisplayName("create uses provided slug when given")
    void create_usesProvidedSlug() {
        var request = new CreateCategoryRequest("Zapatos", "my-custom-slug", null, null, null, null);
        when(categoryRepository.existsBySlug("my-custom-slug")).thenReturn(false);
        when(categoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = categoryService.create(request);

        assertThat(response.slug()).isEqualTo("my-custom-slug");
    }

    @Test
    @DisplayName("create throws DuplicateSlugException when explicit slug already exists")
    void create_throwsOnDuplicateExplicitSlug() {
        var request = new CreateCategoryRequest("Zapatos", "zapatos", null, null, null, null);
        when(categoryRepository.existsBySlug("zapatos")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.create(request))
                .isInstanceOf(DuplicateSlugException.class);
    }

    @Test
    @DisplayName("delete throws CategoryInUseException when category has active products")
    void delete_throwsWhenCategoryHasActiveProducts() {
        UUID id = UUID.randomUUID();
        Category cat = Category.builder().id(id).name("Sneakers").slug("sneakers").build();
        when(categoryRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(cat));
        when(productRepository.existsActiveByCategoryId(id)).thenReturn(true);

        assertThatThrownBy(() -> categoryService.delete(id, UUID.randomUUID()))
                .isInstanceOf(CategoryInUseException.class)
                .hasMessageContaining("active products");
    }

    @Test
    @DisplayName("delete performs soft delete when no active products")
    void delete_softDeletesWhenNoActiveProducts() {
        UUID id = UUID.randomUUID();
        UUID deletedBy = UUID.randomUUID();
        Category cat = Category.builder().id(id).name("Sneakers").slug("sneakers").active(true).build();
        when(categoryRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(cat));
        when(productRepository.existsActiveByCategoryId(id)).thenReturn(false);
        when(categoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        categoryService.delete(id, deletedBy);

        verify(categoryRepository).save(any());
        assertThat(cat.getDeletedAt()).isNotNull();
        assertThat(cat.getDeletedBy()).isEqualTo(deletedBy);
        assertThat(cat.getActive()).isFalse();
    }

    @Test
    @DisplayName("delete throws ResourceNotFoundException when category not found")
    void delete_throwsWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(categoryRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.delete(id, UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("restore resets deletedAt and sets active=false")
    void restore_resetsDeletedAtAndSetsInactive() {
        UUID id = UUID.randomUUID();
        Category cat = Category.builder()
                .id(id)
                .name("Sneakers")
                .slug("sneakers")
                .deletedAt(Instant.now())
                .active(false)
                .build();
        when(categoryRepository.findById(id)).thenReturn(Optional.of(cat));
        when(categoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = categoryService.restore(id);

        assertThat(response.deletedAt()).isNull();
        assertThat(response.active()).isFalse();
    }

    @Test
    @DisplayName("updateStatus changes active flag")
    void updateStatus_changesActiveFlag() {
        UUID id = UUID.randomUUID();
        Category cat = Category.builder().id(id).name("Cat").slug("cat").active(true).build();
        when(categoryRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(cat));
        when(categoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = categoryService.updateStatus(id, new UpdateCategoryStatusRequest(false));

        assertThat(response.active()).isFalse();
    }
}
