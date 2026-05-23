package com.stepup.audit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.stepup.audit.entity.EntitySnapshot;
import com.stepup.audit.entity.RestoreAction;
import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.enums.SnapshotReason;
import com.stepup.audit.repository.RestoreActionRepository;
import com.stepup.categories.entity.Category;
import com.stepup.categories.repository.CategoryRepository;
import com.stepup.common.exception.RestoreNotAllowedException;
import com.stepup.common.exception.SnapshotNotFoundException;
import com.stepup.common.exception.UnsupportedRestoreTypeException;
import com.stepup.common.service.SlugService;
import com.stepup.products.entity.Product;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import com.stepup.products.repository.ProductRepository;
import com.stepup.promotions.repository.PromotionRepository;
import com.stepup.users.Role;
import com.stepup.users.User;
import com.stepup.users.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("RestoreService Unit Tests")
class RestoreServiceTest {

    @Mock private EntitySnapshotService entitySnapshotService;
    @Mock private AuditLogService auditLogService;
    @Mock private RestoreActionRepository restoreActionRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private PromotionRepository promotionRepository;

    private RestoreService restoreService;
    private EntitySerializationService serializer;
    private User superAdmin;

    @BeforeEach
    void setUp() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        serializer = new EntitySerializationService(mapper);
        restoreService = new RestoreService(entitySnapshotService, auditLogService, serializer,
                restoreActionRepository, productRepository, categoryRepository, promotionRepository, new SlugService());

        superAdmin = User.builder()
                .id(UUID.randomUUID()).email("super@stepup.com")
                .passwordHash("$2a$12$hash").fullName("Super Admin")
                .role(Role.SUPER_ADMIN).status(UserStatus.ACTIVE).build();
    }

    @Test
    @DisplayName("restoreFromSnapshot throws SnapshotNotFoundException when snapshot missing")
    void restore_throwsWhenSnapshotMissing() {
        UUID snapshotId = UUID.randomUUID();
        when(entitySnapshotService.getById(snapshotId))
                .thenThrow(new SnapshotNotFoundException(snapshotId));

        assertThatThrownBy(() -> restoreService.restoreFromSnapshot(snapshotId, "reason", superAdmin))
                .isInstanceOf(SnapshotNotFoundException.class);
    }

    @Test
    @DisplayName("restoreFromSnapshot throws UnsupportedRestoreTypeException for USER entity")
    void restore_throwsForUnsupportedEntityType() {
        UUID snapshotId = UUID.randomUUID();
        EntitySnapshot snapshot = EntitySnapshot.builder()
                .id(snapshotId)
                .entityType(AuditableEntityType.USER)
                .entityId(UUID.randomUUID())
                .snapshotReason(SnapshotReason.BEFORE_DELETE)
                .beforeData("{\"id\":\"test\"}")
                .build();
        when(entitySnapshotService.getById(snapshotId)).thenReturn(snapshot);

        assertThatThrownBy(() -> restoreService.restoreFromSnapshot(snapshotId, "reason", superAdmin))
                .isInstanceOf(UnsupportedRestoreTypeException.class)
                .hasMessageContaining("USER");
    }

    @Test
    @DisplayName("restoreFromSnapshot throws RestoreNotAllowedException when both data fields are null")
    void restore_throwsWhenNoRestorableData() {
        UUID snapshotId = UUID.randomUUID();
        EntitySnapshot snapshot = EntitySnapshot.builder()
                .id(snapshotId)
                .entityType(AuditableEntityType.PRODUCT)
                .entityId(UUID.randomUUID())
                .snapshotReason(SnapshotReason.SYSTEM)
                .beforeData(null).afterData(null)
                .build();
        when(entitySnapshotService.getById(snapshotId)).thenReturn(snapshot);

        assertThatThrownBy(() -> restoreService.restoreFromSnapshot(snapshotId, "reason", superAdmin))
                .isInstanceOf(RestoreNotAllowedException.class)
                .hasMessageContaining("no restorable data");
    }

    @Test
    @DisplayName("Product restore sets status=DRAFT and visible=false (safety default)")
    void restoreProduct_setsDraftAndInvisible() {
        UUID productId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        Category category = Category.builder()
                .id(categoryId).name("Sneakers").slug("sneakers").active(true).build();

        Product product = Product.builder()
                .id(productId).name("Nike Air").slug("nike-air").category(category)
                .price(BigDecimal.TEN).status(ProductStatus.DELETED).stockStatus(StockStatus.AVAILABLE)
                .isNew(false).isOnSale(false).isFeatured(false).visible(false)
                .displayOrder(0).deletedAt(Instant.now()).deletedBy(UUID.randomUUID())
                .images(new ArrayList<>()).sizes(new ArrayList<>())
                .build();

        String beforeJson = serializer.serializeProductToJson(product);
        // Make snapshot with ACTIVE status in data
        String snapshotData = beforeJson.replace("\"DELETED\"", "\"ACTIVE\"")
                                        .replace("\"visible\":false", "\"visible\":true");

        EntitySnapshot snapshot = EntitySnapshot.builder()
                .id(UUID.randomUUID()).entityType(AuditableEntityType.PRODUCT).entityId(productId)
                .snapshotReason(SnapshotReason.BEFORE_DELETE).beforeData(snapshotData).build();

        when(entitySnapshotService.getById(snapshot.getId())).thenReturn(snapshot);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(categoryRepository.findByIdAndDeletedAtIsNull(categoryId)).thenReturn(Optional.of(category));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(auditLogService.log(any(), any(), any(), any(), any(), any())).thenReturn(null);
        when(restoreActionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RestoreAction result = restoreService.restoreFromSnapshot(snapshot.getId(), "test restore", superAdmin);

        assertThat(product.getStatus()).isEqualTo(ProductStatus.DRAFT);
        assertThat(product.getVisible()).isFalse();
        assertThat(product.getDeletedAt()).isNull();
        assertThat(product.getDeletedBy()).isNull();
        assertThat(result).isNotNull();
        verify(restoreActionRepository).save(any());
        verify(auditLogService).log(any(AuditAction.class), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("AFTER_UPDATE snapshot restores afterData, not beforeData")
    void restore_afterUpdateUsesAfterData() {
        UUID productId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        Category category = Category.builder()
                .id(categoryId).name("Sneakers").slug("sneakers").active(true).build();

        Product product = Product.builder()
                .id(productId).name("Old Name").slug("old-name").category(category)
                .price(BigDecimal.ONE).status(ProductStatus.ACTIVE).stockStatus(StockStatus.AVAILABLE)
                .isNew(false).isOnSale(false).isFeatured(false).visible(true).displayOrder(0)
                .images(new ArrayList<>()).sizes(new ArrayList<>()).build();

        // beforeData = "Old Name" / price 1   ;   afterData = "New Name" / price 99
        String beforeData = String.format(
                "{\"name\":\"Old Name\",\"slug\":\"old-name\",\"categoryId\":\"%s\"," +
                "\"price\":1,\"status\":\"ACTIVE\",\"stockStatus\":\"AVAILABLE\"," +
                "\"isNew\":false,\"isOnSale\":false,\"isFeatured\":false,\"visible\":true," +
                "\"displayOrder\":0}", categoryId);
        String afterData = String.format(
                "{\"name\":\"New Name\",\"slug\":\"new-name\",\"categoryId\":\"%s\"," +
                "\"price\":99,\"status\":\"ACTIVE\",\"stockStatus\":\"AVAILABLE\"," +
                "\"isNew\":false,\"isOnSale\":false,\"isFeatured\":false,\"visible\":true," +
                "\"displayOrder\":0}", categoryId);

        EntitySnapshot snapshot = EntitySnapshot.builder()
                .id(UUID.randomUUID()).entityType(AuditableEntityType.PRODUCT).entityId(productId)
                .snapshotReason(SnapshotReason.AFTER_UPDATE)
                .beforeData(beforeData).afterData(afterData).build();

        when(entitySnapshotService.getById(snapshot.getId())).thenReturn(snapshot);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(categoryRepository.findByIdAndDeletedAtIsNull(categoryId)).thenReturn(Optional.of(category));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(auditLogService.log(any(), any(), any(), any(), any(), any())).thenReturn(null);
        when(restoreActionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        restoreService.restoreFromSnapshot(snapshot.getId(), "rollforward", superAdmin);

        // afterData wins for AFTER_UPDATE
        assertThat(product.getName()).isEqualTo("New Name");
        assertThat(product.getPrice()).isEqualByComparingTo(new BigDecimal("99"));
    }

    @Test
    @DisplayName("BEFORE_UPDATE snapshot restores beforeData, not afterData")
    void restore_beforeUpdateUsesBeforeData() {
        UUID productId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        Category category = Category.builder()
                .id(categoryId).name("Sneakers").slug("sneakers").active(true).build();

        Product product = Product.builder()
                .id(productId).name("Current").slug("current").category(category)
                .price(BigDecimal.ONE).status(ProductStatus.ACTIVE).stockStatus(StockStatus.AVAILABLE)
                .isNew(false).isOnSale(false).isFeatured(false).visible(true).displayOrder(0)
                .images(new ArrayList<>()).sizes(new ArrayList<>()).build();

        String beforeData = String.format(
                "{\"name\":\"Original\",\"slug\":\"original\",\"categoryId\":\"%s\"," +
                "\"price\":50,\"status\":\"ACTIVE\",\"stockStatus\":\"AVAILABLE\"," +
                "\"isNew\":false,\"isOnSale\":false,\"isFeatured\":false,\"visible\":true," +
                "\"displayOrder\":0}", categoryId);
        String afterData = String.format(
                "{\"name\":\"Updated\",\"slug\":\"updated\",\"categoryId\":\"%s\"," +
                "\"price\":200,\"status\":\"ACTIVE\",\"stockStatus\":\"AVAILABLE\"," +
                "\"isNew\":false,\"isOnSale\":false,\"isFeatured\":false,\"visible\":true," +
                "\"displayOrder\":0}", categoryId);

        EntitySnapshot snapshot = EntitySnapshot.builder()
                .id(UUID.randomUUID()).entityType(AuditableEntityType.PRODUCT).entityId(productId)
                .snapshotReason(SnapshotReason.BEFORE_UPDATE)
                .beforeData(beforeData).afterData(afterData).build();

        when(entitySnapshotService.getById(snapshot.getId())).thenReturn(snapshot);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(categoryRepository.findByIdAndDeletedAtIsNull(categoryId)).thenReturn(Optional.of(category));
        when(productRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(auditLogService.log(any(), any(), any(), any(), any(), any())).thenReturn(null);
        when(restoreActionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        restoreService.restoreFromSnapshot(snapshot.getId(), "rollback", superAdmin);

        // beforeData wins for BEFORE_UPDATE — we want the pre-update state back
        assertThat(product.getName()).isEqualTo("Original");
        assertThat(product.getPrice()).isEqualByComparingTo(new BigDecimal("50"));
    }

    @Test
    @DisplayName("Product restore throws RestoreNotAllowedException when category is deleted")
    void restoreProduct_throwsWhenCategoryDeleted() {
        UUID productId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();

        Category category = Category.builder()
                .id(categoryId).name("Sneakers").slug("sneakers").build();
        Product product = Product.builder()
                .id(productId).name("Nike").slug("nike").category(category)
                .price(BigDecimal.TEN).status(ProductStatus.DELETED).stockStatus(StockStatus.AVAILABLE)
                .isNew(false).isOnSale(false).isFeatured(false).visible(false).displayOrder(0)
                .images(new ArrayList<>()).sizes(new ArrayList<>()).build();

        String snapshotData = serializer.serializeProductToJson(product);
        EntitySnapshot snapshot = EntitySnapshot.builder()
                .id(UUID.randomUUID()).entityType(AuditableEntityType.PRODUCT).entityId(productId)
                .snapshotReason(SnapshotReason.BEFORE_DELETE).beforeData(snapshotData).build();

        when(entitySnapshotService.getById(snapshot.getId())).thenReturn(snapshot);
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(categoryRepository.findByIdAndDeletedAtIsNull(categoryId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> restoreService.restoreFromSnapshot(snapshot.getId(), "reason", superAdmin))
                .isInstanceOf(RestoreNotAllowedException.class)
                .hasMessageContaining("Category from snapshot");
    }
}
