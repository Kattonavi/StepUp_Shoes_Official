package com.stepup.categories.mapper;

import com.stepup.categories.dto.CategoryResponse;
import com.stepup.categories.entity.Category;

import java.util.List;

public final class CategoryMapper {

    private CategoryMapper() {}

    public static CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getIcon(),
                category.getDescription(),
                category.getPosition(),
                category.getActive(),
                category.getCreatedAt(),
                category.getUpdatedAt(),
                category.getDeletedAt()
        );
    }

    public static List<CategoryResponse> toResponseList(List<Category> categories) {
        return categories.stream().map(CategoryMapper::toResponse).toList();
    }
}
