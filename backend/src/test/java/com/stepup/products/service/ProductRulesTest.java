package com.stepup.products.service;

import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.categories.entity.Category;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.common.exception.BadRequestException;
import com.stepup.common.exception.InvalidProductStateException;
import com.stepup.common.exception.ResourceNotFoundException;
import com.stepup.common.service.SlugService;
import com.stepup.products.dto.CreateProductRequest;
import com.stepup.products.dto.ProductSizeRequest;
import com.stepup.products.dto.UpdateProductRequest;
import com.stepup.products.dto.UpdateProductStatusRequest;
import com.stepup.products.dto.UpdateProductVisibilityRequest;
import com.stepup.products.entity.Product;
import com.stepup.products.entity.ProductSize;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import com.stepup.products.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Business Rules")
class ProductRulesTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private AuditLogService auditLogService;
    @Mock private EntitySerializationService entitySerializationService;

    private ProductService productService;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository, categoryRepository,
                new SlugService(), auditLogService, entitySerializationService);

        sampleCategory = Category.builder()
                .id(UUID.randomUUID()).name("Sneakers").slug("sneakers").active(true).build();

        // stub serializer so audit calls don't NPE
        lenient().when(entitySerializationService.serializeProductToJson(any())).thenReturn("{}");
    }

    @Test
    @DisplayName("create with oldPrice > price marks product as isOnSale=true")
    void create_withOldPrice_setsIsOnSaleTrue() {
        // price=80, oldPrice=100 → 20% discount → isOnSale=true
        var request = new CreateProductRequest(
                "Nike Air", null, null, sampleCategory.getId(),
                new BigDecimal("80"), new BigDecimal("100"),
                ProductStatus.ACTIVE, StockStatus.AVAILABLE,
                false, false, true,
                null, null, null, null, null
        );

        when(categoryRepository.findByIdAndDeletedAtIsNull(sampleCategory.getId()))
                .thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsBySlug(any())).thenReturn(false);
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = productService.create(request);

        assertThat(response.isOnSale()).isTrue();
        assertThat(response.discountPercentage()).isNotNull();
        assertThat(response.discountPercentage().doubleValue()).isEqualTo(20.0);
    }

    @Test
    @DisplayName("soft delete marks product as DELETED, visible=false, sets deletedAt")
    void delete_setsDeletedStateCorrectly() {
        UUID id = UUID.randomUUID();
        UUID deletedBy = UUID.randomUUID();
        Product product = buildActiveProduct(id);

        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productService.delete(id, deletedBy);

        assertThat(product.getStatus()).isEqualTo(ProductStatus.DELETED);
        assertThat(product.getVisible()).isFalse();
        assertThat(product.getDeletedAt()).isNotNull();
        assertThat(product.getDeletedBy()).isEqualTo(deletedBy);
    }

    @Test
    @DisplayName("restore returns product as DRAFT with visible=false")
    void restore_setsDraftAndInvisible() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        product.setStatus(ProductStatus.DELETED);
        product.setVisible(false);
        product.setDeletedAt(Instant.now());
        product.setDeletedBy(UUID.randomUUID());

        when(productRepository.findById(id)).thenReturn(Optional.of(product));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var response = productService.restore(id);

        assertThat(response.status()).isEqualTo(ProductStatus.DRAFT);
        assertThat(response.visible()).isFalse();
        assertThat(response.deletedAt()).isNull();
    }

    @Test
    @DisplayName("restore throws when product is not deleted")
    void restore_throwsWhenNotDeleted() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);

        when(productRepository.findById(id)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.restore(id))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not deleted");
    }

    @Test
    @DisplayName("updateStatus rejects DELETED via status endpoint")
    void updateStatus_rejectsDELETED() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.updateStatus(id, new UpdateProductStatusRequest(ProductStatus.DELETED)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("DELETE endpoint");
    }

    @Test
    @DisplayName("updateVisibility throws when product is DELETED")
    void updateVisibility_throwsOnDeletedProduct() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        product.setStatus(ProductStatus.DELETED);

        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.updateVisibility(id, new UpdateProductVisibilityRequest(true)))
                .isInstanceOf(InvalidProductStateException.class);
    }

    @Test
    @DisplayName("getPublicById returns 404 for non-visible product")
    void getPublicById_throwsForNonVisible() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        product.setVisible(false);

        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.getPublicById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("getPublicById returns 404 for DRAFT product")
    void getPublicById_throwsForDraftProduct() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        product.setStatus(ProductStatus.DRAFT);

        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> productService.getPublicById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── sizes normalization & diff on update ─────────────────────────────────

    @Test
    @DisplayName("create normalizes + dedupes sizes (trim, upper, drop blanks, drop duplicates)")
    void create_dedupesSizes() {
        var request = new CreateProductRequest(
                "Nike Air", null, null, sampleCategory.getId(),
                new BigDecimal("100"), null,
                ProductStatus.ACTIVE, StockStatus.AVAILABLE,
                false, false, true,
                null, null, null, null,
                List.of(
                        new ProductSizeRequest("40", 1, true),
                        new ProductSizeRequest("40", 1, true),
                        new ProductSizeRequest(" 40 ", 1, true),
                        new ProductSizeRequest("m", 1, true),
                        new ProductSizeRequest("M", 1, true),
                        new ProductSizeRequest("", 1, true)
                )
        );

        when(categoryRepository.findByIdAndDeletedAtIsNull(sampleCategory.getId()))
                .thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsBySlug(any())).thenReturn(false);
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productService.create(request);

        // verify by argument capture on the second save — sizes already attached.
        var captured = org.mockito.ArgumentCaptor.forClass(Product.class);
        org.mockito.Mockito.verify(productRepository, org.mockito.Mockito.atLeastOnce()).save(captured.capture());
        Product saved = captured.getAllValues().get(captured.getAllValues().size() - 1);

        assertThat(saved.getSizes())
                .extracting(ProductSize::getSize)
                .containsExactly("40", "M");
    }

    @Test
    @DisplayName("update keeping existing size 40 does NOT delete+reinsert (no duplicate row)")
    void update_keepsExistingSizeWithoutDuplicate() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        ProductSize existing40 = ProductSize.builder()
                .id(UUID.randomUUID()).product(product).size("40").stockQuantity(3).available(true).build();
        product.getSizes().add(existing40);

        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));
        when(categoryRepository.findByIdAndDeletedAtIsNull(sampleCategory.getId()))
                .thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsBySlugAndIdNot(any(), any())).thenReturn(false);
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var request = updateRequestWithSizes(List.of(new ProductSizeRequest("40", 5, true)));
        productService.update(id, request);

        assertThat(product.getSizes()).hasSize(1);
        ProductSize remaining = product.getSizes().get(0);
        assertThat(remaining.getSize()).isEqualTo("40");
        // It must be the SAME entity (no delete+re-insert) and qty updated.
        assertThat(remaining).isSameAs(existing40);
        assertThat(remaining.getStockQuantity()).isEqualTo(5);
    }

    @Test
    @DisplayName("update adding 41/42 keeps 40 and inserts only the new sizes")
    void update_keepsAndAddsNewSizes() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        ProductSize existing40 = ProductSize.builder()
                .id(UUID.randomUUID()).product(product).size("40").stockQuantity(1).available(true).build();
        product.getSizes().add(existing40);

        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));
        when(categoryRepository.findByIdAndDeletedAtIsNull(sampleCategory.getId()))
                .thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsBySlugAndIdNot(any(), any())).thenReturn(false);
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var request = updateRequestWithSizes(List.of(
                new ProductSizeRequest("40", 1, true),
                new ProductSizeRequest("41", 1, true),
                new ProductSizeRequest("42", 1, true)
        ));
        productService.update(id, request);

        assertThat(product.getSizes())
                .extracting(ProductSize::getSize)
                .containsExactlyInAnyOrder("40", "41", "42");
        // The 40 entity is the same instance (kept, not reinserted).
        assertThat(product.getSizes()).contains(existing40);
    }

    @Test
    @DisplayName("update with duplicate raw input deduplicates without throwing")
    void update_dedupesDuplicateRawSizes() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        product.getSizes().add(ProductSize.builder()
                .id(UUID.randomUUID()).product(product).size("40").stockQuantity(1).available(true).build());

        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));
        when(categoryRepository.findByIdAndDeletedAtIsNull(sampleCategory.getId()))
                .thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsBySlugAndIdNot(any(), any())).thenReturn(false);
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var request = updateRequestWithSizes(List.of(
                new ProductSizeRequest("40", 2, true),
                new ProductSizeRequest(" 40 ", 9, true),
                new ProductSizeRequest("m", 1, true),
                new ProductSizeRequest("M", 1, true)
        ));
        productService.update(id, request);

        assertThat(product.getSizes())
                .extracting(ProductSize::getSize)
                .containsExactlyInAnyOrder("40", "M");
    }

    @Test
    @DisplayName("update with empty list removes all existing sizes")
    void update_emptyListRemovesAll() {
        UUID id = UUID.randomUUID();
        Product product = buildActiveProduct(id);
        product.getSizes().add(ProductSize.builder()
                .id(UUID.randomUUID()).product(product).size("40").stockQuantity(1).available(true).build());
        product.getSizes().add(ProductSize.builder()
                .id(UUID.randomUUID()).product(product).size("41").stockQuantity(1).available(true).build());

        when(productRepository.findByIdAndDeletedAtIsNull(id)).thenReturn(Optional.of(product));
        when(categoryRepository.findByIdAndDeletedAtIsNull(sampleCategory.getId()))
                .thenReturn(Optional.of(sampleCategory));
        when(productRepository.existsBySlugAndIdNot(any(), any())).thenReturn(false);
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var request = updateRequestWithSizes(List.of());
        productService.update(id, request);

        assertThat(product.getSizes()).isEmpty();
    }

    private UpdateProductRequest updateRequestWithSizes(List<ProductSizeRequest> sizes) {
        return new UpdateProductRequest(
                "Nike Air", null, null, sampleCategory.getId(),
                new BigDecimal("100"), null,
                ProductStatus.ACTIVE, StockStatus.AVAILABLE,
                false, false, true,
                null, null, null,
                null, // images — null means keep existing
                sizes
        );
    }

    // ─── helpers ──────────────────────────────────────────────────────────────

    private Product buildActiveProduct(UUID id) {
        return Product.builder()
                .id(id)
                .name("Nike Air")
                .slug("nike-air")
                .category(sampleCategory)
                .price(BigDecimal.TEN)
                .status(ProductStatus.ACTIVE)
                .stockStatus(StockStatus.AVAILABLE)
                .visible(true)
                .isNew(false)
                .isOnSale(false)
                .isFeatured(false)
                .displayOrder(0)
                .images(new ArrayList<>())
                .sizes(new ArrayList<>())
                .build();
    }
}
