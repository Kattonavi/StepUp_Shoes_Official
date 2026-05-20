package com.stepup.products.repository;

import com.stepup.products.entity.Product;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByIdAndDeletedAtIsNull(UUID id);

    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.slug = :slug AND p.id <> :excludeId")
    boolean existsBySlugAndIdNot(@Param("slug") String slug, @Param("excludeId") UUID excludeId);

    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.category.id = :categoryId AND p.deletedAt IS NULL")
    boolean existsActiveByCategoryId(@Param("categoryId") UUID categoryId);

    // --- Dashboard metrics ---

    long countByDeletedAtIsNull();

    long countByDeletedAtIsNotNull();

    long countByStatusAndDeletedAtIsNull(ProductStatus status);

    long countByStockStatusAndDeletedAtIsNull(StockStatus stockStatus);

    long countByIsFeaturedTrueAndDeletedAtIsNull();

    long countByIsNewTrueAndDeletedAtIsNull();

    long countByIsOnSaleTrueAndDeletedAtIsNull();

    long countByVisibleFalseAndDeletedAtIsNull();

    List<Product> findTop5ByDeletedAtIsNullOrderByUpdatedAtDesc();
}
