package com.stepup.products.repository;

import com.stepup.categories.entity.Category;
import com.stepup.products.entity.Product;
import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public final class ProductSpecification {

    private ProductSpecification() {}

    public static Specification<Product> publicCatalog(
            String categorySlug,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            StockStatus stockStatus,
            Boolean isNew,
            Boolean isOnSale,
            Boolean isFeatured) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isNull(root.get("deletedAt")));
            predicates.add(cb.isTrue(root.get("visible")));
            predicates.add(cb.equal(root.get("status"), ProductStatus.ACTIVE));

            if (categorySlug != null && !categorySlug.isBlank()) {
                Join<Product, Category> category = root.join("category", JoinType.INNER);
                predicates.add(cb.equal(category.get("slug"), categorySlug));
                predicates.add(cb.isNull(category.get("deletedAt")));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (stockStatus != null) {
                predicates.add(cb.equal(root.get("stockStatus"), stockStatus));
            }
            if (Boolean.TRUE.equals(isNew)) {
                predicates.add(cb.isTrue(root.get("isNew")));
            }
            if (Boolean.TRUE.equals(isOnSale)) {
                predicates.add(cb.isTrue(root.get("isOnSale")));
            }
            if (Boolean.TRUE.equals(isFeatured)) {
                predicates.add(cb.isTrue(root.get("isFeatured")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> adminCatalog(boolean includeDeleted) {
        return adminCatalog(includeDeleted, null, null, null, null, null, null, null);
    }

    /**
     * Admin catalog spec with all filters applied server-side.
     * - includeDeleted=false only returns non-deleted products.
     * - search matches name OR description (case-insensitive LIKE).
     * - status is the technical ProductStatus filter (ACTIVE/DRAFT/HIDDEN).
     *   When status=DELETED is requested, it implies includeDeleted=true.
     */
    public static Specification<Product> adminCatalog(
            boolean includeDeleted,
            String search,
            String categorySlug,
            StockStatus stockStatus,
            Boolean isNew,
            Boolean isFeatured,
            Boolean isOnSale,
            ProductStatus status) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Soft-delete filter:
            //   if caller asks for status=DELETED, return only deleted rows
            //   else if includeDeleted=false, exclude deleted
            if (status == ProductStatus.DELETED) {
                predicates.add(cb.isNotNull(root.get("deletedAt")));
            } else if (!includeDeleted) {
                predicates.add(cb.isNull(root.get("deletedAt")));
            }

            // Technical status filter (non-DELETED case; DELETED handled above)
            if (status != null && status != ProductStatus.DELETED) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (categorySlug != null && !categorySlug.isBlank()) {
                Join<Product, Category> category = root.join("category", JoinType.INNER);
                predicates.add(cb.equal(category.get("slug"), categorySlug));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (stockStatus != null) {
                predicates.add(cb.equal(root.get("stockStatus"), stockStatus));
            }
            if (Boolean.TRUE.equals(isNew)) {
                predicates.add(cb.isTrue(root.get("isNew")));
            }
            if (Boolean.TRUE.equals(isFeatured)) {
                predicates.add(cb.isTrue(root.get("isFeatured")));
            }
            if (Boolean.TRUE.equals(isOnSale)) {
                predicates.add(cb.isTrue(root.get("isOnSale")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> deletedOnly() {
        return (root, query, cb) -> cb.isNotNull(root.get("deletedAt"));
    }
}
