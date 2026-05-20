package com.stepup.common.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("SlugService Unit Tests")
class SlugServiceTest {

    private final SlugService slugService = new SlugService();

    @ParameterizedTest(name = "slugify({0}) = {1}")
    @CsvSource({
            "Zapatos de Cuero,     zapatos-de-cuero",
            "NIKE AIR MAX 90,      nike-air-max-90",
            "Tenis & Zapatillas!,  tenis-zapatillas",
            "  leading spaces  ,   leading-spaces",
            "múltiples--guiones,   multiples-guiones",
            "ñoño ñandú,           nono-nandu",
            "café con leche,       cafe-con-leche",
    })
    @DisplayName("slugify normalizes text correctly")
    void slugify_normalizesCorrectly(String input, String expected) {
        assertThat(slugService.slugify(input.trim())).isEqualTo(expected.trim());
    }

    @Test
    @DisplayName("slugify throws on blank input")
    void slugify_throwsOnBlank() {
        assertThatThrownBy(() -> slugService.slugify("   "))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> slugService.slugify(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("generateUniqueSlug returns base slug when not taken")
    void generateUniqueSlug_returnsBaseWhenFree() {
        Set<String> existing = Set.of();
        String slug = slugService.generateUniqueSlug("Zapatos", existing::contains);
        assertThat(slug).isEqualTo("zapatos");
    }

    @Test
    @DisplayName("generateUniqueSlug appends counter when base is taken")
    void generateUniqueSlug_appendsCounterWhenTaken() {
        Set<String> existing = Set.of("zapatos", "zapatos-2");
        String slug = slugService.generateUniqueSlug("Zapatos", existing::contains);
        assertThat(slug).isEqualTo("zapatos-3");
    }

    @Test
    @DisplayName("generateUniqueSlug increments counter correctly across many collisions")
    void generateUniqueSlug_incrementsAcrossManyCols() {
        Set<String> existing = Set.of("nike", "nike-2", "nike-3", "nike-4");
        String slug = slugService.generateUniqueSlug("Nike", existing::contains);
        assertThat(slug).isEqualTo("nike-5");
    }
}
