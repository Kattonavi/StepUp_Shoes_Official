package com.stepup.storefront.repository;

import com.stepup.storefront.entity.StorefrontEvent;
import com.stepup.storefront.enums.StorefrontEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface StorefrontEventRepository extends JpaRepository<StorefrontEvent, UUID> {

    long countByEventTypeAndCreatedAtGreaterThanEqual(StorefrontEventType eventType, Instant from);

    /** Eventos recientes dentro del rango, más nuevos primero. */
    List<StorefrontEvent> findTop25ByCreatedAtGreaterThanEqualOrderByCreatedAtDesc(Instant from);

    /**
     * Vistas agrupadas por producto dentro del rango.
     * Filas: [productId, productName, productSlug, categoryName, count, maxCreatedAt]
     */
    @Query("""
            SELECT e.productId, e.productName, e.productSlug, e.categoryName,
                   COUNT(e), MAX(e.createdAt)
            FROM StorefrontEvent e
            WHERE e.eventType = com.stepup.storefront.enums.StorefrontEventType.PRODUCT_VIEW
              AND e.productId IS NOT NULL
              AND e.createdAt >= :from
            GROUP BY e.productId, e.productName, e.productSlug, e.categoryName
            ORDER BY COUNT(e) DESC
            """)
    List<Object[]> viewsByProduct(@Param("from") Instant from);

    /**
     * Consultas WhatsApp agrupadas por producto dentro del rango.
     * Filas: [productId, count]
     */
    @Query("""
            SELECT e.productId, COUNT(e)
            FROM StorefrontEvent e
            WHERE e.eventType = com.stepup.storefront.enums.StorefrontEventType.WHATSAPP_CLICK
              AND e.productId IS NOT NULL
              AND e.createdAt >= :from
            GROUP BY e.productId
            """)
    List<Object[]> whatsappByProduct(@Param("from") Instant from);

    /**
     * Vistas (producto + categoría) agrupadas por categoría dentro del rango.
     * Filas: [categoryId, categoryName, categorySlug, count]
     */
    @Query("""
            SELECT e.categoryId, e.categoryName, e.categorySlug, COUNT(e)
            FROM StorefrontEvent e
            WHERE e.eventType IN (
                    com.stepup.storefront.enums.StorefrontEventType.PRODUCT_VIEW,
                    com.stepup.storefront.enums.StorefrontEventType.CATEGORY_VIEW)
              AND e.categoryId IS NOT NULL
              AND e.createdAt >= :from
            GROUP BY e.categoryId, e.categoryName, e.categorySlug
            ORDER BY COUNT(e) DESC
            """)
    List<Object[]> viewsByCategory(@Param("from") Instant from);

    /**
     * Consultas WhatsApp agrupadas por categoría dentro del rango.
     * Filas: [categoryId, count]
     */
    @Query("""
            SELECT e.categoryId, COUNT(e)
            FROM StorefrontEvent e
            WHERE e.eventType = com.stepup.storefront.enums.StorefrontEventType.WHATSAPP_CLICK
              AND e.categoryId IS NOT NULL
              AND e.createdAt >= :from
            GROUP BY e.categoryId
            """)
    List<Object[]> whatsappByCategory(@Param("from") Instant from);
}
