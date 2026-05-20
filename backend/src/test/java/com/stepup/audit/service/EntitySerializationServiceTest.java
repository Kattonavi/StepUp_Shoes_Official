package com.stepup.audit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.stepup.categories.entity.Category;
import com.stepup.products.entity.Product;
import com.stepup.products.entity.ProductImage;
import com.stepup.products.entity.ProductSize;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import com.stepup.users.Role;
import com.stepup.users.User;
import com.stepup.users.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("EntitySerializationService Unit Tests")
class EntitySerializationServiceTest {

    private EntitySerializationService service;

    @BeforeEach
    void setUp() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        service = new EntitySerializationService(mapper);
    }

    @Test
    @DisplayName("User serialization NEVER includes passwordHash")
    void serializeUser_neverIncludesPasswordHash() {
        User user = User.builder()
                .id(UUID.randomUUID()).email("test@example.com")
                .passwordHash("$2a$12$superSecretBcryptHash")
                .fullName("Test User").role(Role.ADMIN).status(UserStatus.ACTIVE)
                .build();

        Map<String, Object> result = service.serializeUser(user);

        assertThat(result).doesNotContainKey("passwordHash");
        assertThat(result.get("email")).isEqualTo("test@example.com");
        assertThat(result.get("role")).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("User JSON NEVER contains passwordHash string")
    void serializeUserToJson_neverContainsPasswordHash() {
        User user = User.builder()
                .id(UUID.randomUUID()).email("admin@stepup.com")
                .passwordHash("$2a$12$VERY_SECRET_HASH_VALUE")
                .fullName("Admin").role(Role.SUPER_ADMIN).status(UserStatus.ACTIVE)
                .build();

        String json = service.serializeUserToJson(user);

        assertThat(json).doesNotContain("passwordHash");
        assertThat(json).doesNotContain("VERY_SECRET_HASH_VALUE");
        assertThat(json).contains("admin@stepup.com");
    }

    @Test
    @DisplayName("Product snapshot contains images list")
    void serializeProduct_containsImages() {
        Category cat = Category.builder()
                .id(UUID.randomUUID()).name("Sneakers").slug("sneakers").build();
        ProductImage img = ProductImage.builder()
                .id(UUID.randomUUID()).url("https://cdn/img.jpg")
                .altText("Main").position(0).mainImage(true).build();
        Product product = buildProduct(cat, List.of(img), List.of());

        Map<String, Object> result = service.serializeProduct(product);

        assertThat(result).containsKey("images");
        assertThat(result.get("images")).isInstanceOf(List.class);
        List<?> images = (List<?>) result.get("images");
        assertThat(images).hasSize(1);
    }

    @Test
    @DisplayName("Product snapshot contains sizes list")
    void serializeProduct_containsSizes() {
        Category cat = Category.builder()
                .id(UUID.randomUUID()).name("Sneakers").slug("sneakers").build();
        ProductSize sz = ProductSize.builder()
                .id(UUID.randomUUID()).size("42").stockQuantity(5).available(true).build();
        Product product = buildProduct(cat, List.of(), List.of(sz));

        Map<String, Object> result = service.serializeProduct(product);

        assertThat(result).containsKey("sizes");
        List<?> sizes = (List<?>) result.get("sizes");
        assertThat(sizes).hasSize(1);
    }

    @Test
    @DisplayName("Category snapshot contains expected fields")
    void serializeCategory_containsExpectedFields() {
        Category cat = Category.builder()
                .id(UUID.randomUUID()).name("Running").slug("running")
                .icon("🏃").description("Running shoes").position(2).active(true)
                .build();

        Map<String, Object> result = service.serializeCategory(cat);

        assertThat(result.get("name")).isEqualTo("Running");
        assertThat(result.get("slug")).isEqualTo("running");
        assertThat(result.get("icon")).isEqualTo("🏃");
        assertThat(result.get("active")).isEqualTo(true);
        assertThat(result).containsKey("deletedAt");
    }

    @Test
    @DisplayName("fromJson round-trips correctly")
    void fromJson_roundTripsCorrectly() {
        Category cat = Category.builder()
                .id(UUID.randomUUID()).name("Test").slug("test").build();
        String json = service.serializeCategoryToJson(cat);
        Map<String, Object> parsed = service.fromJson(json);

        assertThat(parsed.get("name")).isEqualTo("Test");
        assertThat(parsed.get("slug")).isEqualTo("test");
    }

    // helper
    private Product buildProduct(Category cat, List<ProductImage> images, List<ProductSize> sizes) {
        Product p = Product.builder()
                .id(UUID.randomUUID()).name("Nike Air").slug("nike-air")
                .category(cat).price(BigDecimal.TEN)
                .status(ProductStatus.ACTIVE).stockStatus(StockStatus.AVAILABLE)
                .isNew(false).isOnSale(false).isFeatured(false).visible(true)
                .displayOrder(0)
                .images(new ArrayList<>(images))
                .sizes(new ArrayList<>(sizes))
                .build();
        images.forEach(img -> img.setProduct(p));
        sizes.forEach(sz -> sz.setProduct(p));
        return p;
    }
}
