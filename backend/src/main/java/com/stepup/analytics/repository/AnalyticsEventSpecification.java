package com.stepup.analytics.repository;

import com.stepup.analytics.entity.AnalyticsEvent;
import com.stepup.analytics.enums.AnalyticsEventType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class AnalyticsEventSpecification {

    private AnalyticsEventSpecification() {}

    public static Specification<AnalyticsEvent> buildFilter(
            AnalyticsEventType eventType,
            UUID productId,
            String productSlug,
            UUID categoryId,
            String categorySlug,
            Instant from,
            Instant to
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (eventType != null) {
                predicates.add(cb.equal(root.get("eventType"), eventType));
            }
            if (productId != null) {
                predicates.add(cb.equal(root.get("productId"), productId));
            }
            if (productSlug != null && !productSlug.isBlank()) {
                predicates.add(cb.equal(root.get("productSlug"), productSlug));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("categoryId"), categoryId));
            }
            if (categorySlug != null && !categorySlug.isBlank()) {
                predicates.add(cb.equal(root.get("categorySlug"), categorySlug));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
