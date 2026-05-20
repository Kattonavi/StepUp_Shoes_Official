package com.stepup.products.repository;

import com.stepup.products.entity.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ProductSizeRepository extends JpaRepository<ProductSize, UUID> {

    List<ProductSize> findByProductIdOrderBySizeAsc(UUID productId);

    boolean existsByProductIdAndSize(UUID productId, String size);

    @Modifying
    @Query("DELETE FROM ProductSize ps WHERE ps.product.id = :productId")
    void deleteAllByProductId(@Param("productId") UUID productId);
}
