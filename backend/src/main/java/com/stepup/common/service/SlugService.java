package com.stepup.common.service;

import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.function.Predicate;

@Service
public class SlugService {

    public String slugify(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Cannot slugify blank input");
        }
        String normalized = Normalizer.normalize(input.trim(), Normalizer.Form.NFD);
        return normalized
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("[\\s-]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    /**
     * Generates a unique slug from the base string. If the base slug already exists,
     * appends an incrementing counter suffix (e.g., zapatos, zapatos-2, zapatos-3).
     */
    public String generateUniqueSlug(String base, Predicate<String> existsChecker) {
        String slug = slugify(base);
        if (!existsChecker.test(slug)) {
            return slug;
        }
        int counter = 2;
        while (existsChecker.test(slug + "-" + counter)) {
            counter++;
        }
        return slug + "-" + counter;
    }

    /**
     * Generates a unique slug, excluding the given currentId from the uniqueness check.
     * Used when updating an entity to avoid false collision with itself.
     */
    public String generateUniqueSlugExcluding(String base, Object currentId, java.util.function.BiPredicate<String, Object> existsExcluding) {
        String slug = slugify(base);
        if (!existsExcluding.test(slug, currentId)) {
            return slug;
        }
        int counter = 2;
        while (existsExcluding.test(slug + "-" + counter, currentId)) {
            counter++;
        }
        return slug + "-" + counter;
    }
}
