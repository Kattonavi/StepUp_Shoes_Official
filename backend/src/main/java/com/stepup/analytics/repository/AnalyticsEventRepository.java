package com.stepup.analytics.repository;

import com.stepup.analytics.entity.AnalyticsEvent;
import com.stepup.analytics.enums.AnalyticsEventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsEventRepository
        extends JpaRepository<AnalyticsEvent, UUID>, JpaSpecificationExecutor<AnalyticsEvent> {

    long countByCreatedAtAfter(Instant from);

    long countByEventType(AnalyticsEventType eventType);

    @Query("SELECT a FROM AnalyticsEvent a WHERE a.createdAt >= :from ORDER BY a.createdAt ASC")
    List<AnalyticsEvent> findByCreatedAtAfter(@Param("from") Instant from);

    @Query("""
            SELECT a.eventType, COUNT(a)
            FROM AnalyticsEvent a
            GROUP BY a.eventType
            ORDER BY COUNT(a) DESC
            """)
    List<Object[]> countGroupedByEventType();

    /**
     * Returns daily event counts since {@code from} grouped by UTC day.
     * Each row is [day:Date, count:Long]. Runs entirely in PostgreSQL so we do
     * not load every event into memory — safe even with millions of rows.
     */
    @Query(value = """
            SELECT DATE_TRUNC('day', created_at AT TIME ZONE 'UTC')::date AS day,
                   COUNT(*)                                                AS event_count
            FROM analytics_events
            WHERE created_at >= :from
            GROUP BY day
            ORDER BY day ASC
            """, nativeQuery = true)
    List<Object[]> countByDaySince(@Param("from") Instant from);

    @Query("""
            SELECT a.productSlug, a.productName, COUNT(a)
            FROM AnalyticsEvent a
            WHERE a.eventType = 'PRODUCT_VIEW'
              AND a.productSlug IS NOT NULL
            GROUP BY a.productSlug, a.productName
            ORDER BY COUNT(a) DESC
            """)
    Page<Object[]> findTopProductsByViews(Pageable pageable);

    @Query("""
            SELECT a.categorySlug, a.categoryName, COUNT(a)
            FROM AnalyticsEvent a
            WHERE a.eventType = 'CATEGORY_VIEW'
              AND a.categorySlug IS NOT NULL
            GROUP BY a.categorySlug, a.categoryName
            ORDER BY COUNT(a) DESC
            """)
    Page<Object[]> findTopCategoriesByViews(Pageable pageable);

    @Query("""
            SELECT a.searchQuery, COUNT(a)
            FROM AnalyticsEvent a
            WHERE a.eventType = 'SEARCH'
              AND a.searchQuery IS NOT NULL
              AND a.searchQuery <> ''
            GROUP BY a.searchQuery
            ORDER BY COUNT(a) DESC
            """)
    Page<Object[]> findTopSearches(Pageable pageable);
}
