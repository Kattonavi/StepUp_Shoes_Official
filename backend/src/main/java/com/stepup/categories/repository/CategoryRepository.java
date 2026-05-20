package com.stepup.categories.repository;

import com.stepup.categories.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    // Public catalog: only active, not deleted
    Page<Category> findAllByDeletedAtIsNullAndActiveTrue(Pageable pageable);

    // Admin: all non-deleted
    Page<Category> findAllByDeletedAtIsNull(Pageable pageable);

    // All including deleted (for OWNER/SUPER_ADMIN)
    Page<Category> findAll(Pageable pageable);

    Optional<Category> findBySlugAndDeletedAtIsNull(String slug);

    Optional<Category> findByIdAndDeletedAtIsNull(UUID id);

    boolean existsBySlug(String slug);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.slug = :slug AND c.id <> :excludeId")
    boolean existsBySlugAndIdNot(@Param("slug") String slug, @Param("excludeId") UUID excludeId);

    Page<Category> findAllByDeletedAtIsNotNull(Pageable pageable);

    // --- Dashboard metrics ---

    long countByDeletedAtIsNull();

    long countByDeletedAtIsNullAndActiveTrue();

    long countByDeletedAtIsNullAndActiveFalse();

    long countByDeletedAtIsNotNull();
}
