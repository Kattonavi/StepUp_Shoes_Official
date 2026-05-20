package com.stepup.products.mapper;

import com.stepup.products.dto.ProductImageResponse;
import com.stepup.products.dto.ProductResponse;
import com.stepup.products.dto.ProductSizeResponse;
import com.stepup.products.dto.ProductSummaryResponse;
import com.stepup.products.entity.Product;
import com.stepup.products.entity.ProductImage;
import com.stepup.products.entity.ProductSize;

import java.util.List;

public final class ProductMapper {

    private ProductMapper() {}

    public static ProductResponse toResponse(Product product) {
        List<ProductImageResponse> images = product.getImages() == null ? List.of()
                : product.getImages().stream().map(ProductMapper::toImageResponse).toList();
        List<ProductSizeResponse> sizes = product.getSizes() == null ? List.of()
                : product.getSizes().stream().map(ProductMapper::toSizeResponse).toList();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getCategory().getSlug(),
                product.getPrice(),
                product.getOldPrice(),
                product.getDiscountPercentage(),
                product.getStatus(),
                product.getStockStatus(),
                product.getIsNew(),
                product.getIsOnSale(),
                product.getIsFeatured(),
                product.getVisible(),
                product.getSeoTitle(),
                product.getSeoDescription(),
                product.getDisplayOrder(),
                images,
                sizes,
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.getDeletedAt()
        );
    }

    public static ProductSummaryResponse toSummaryResponse(Product product) {
        String mainImageUrl = null;
        if (product.getImages() != null) {
            mainImageUrl = product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getMainImage()))
                    .findFirst()
                    .map(ProductImage::getUrl)
                    .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());
        }

        return new ProductSummaryResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getPrice(),
                product.getOldPrice(),
                product.getDiscountPercentage(),
                product.getStatus(),
                product.getStockStatus(),
                product.getIsNew(),
                product.getIsOnSale(),
                product.getIsFeatured(),
                product.getVisible(),
                mainImageUrl,
                product.getCreatedAt()
        );
    }

    public static ProductImageResponse toImageResponse(ProductImage image) {
        return new ProductImageResponse(
                image.getId(),
                image.getUrl(),
                image.getAltText(),
                image.getPosition(),
                image.getMainImage()
        );
    }

    public static ProductSizeResponse toSizeResponse(ProductSize size) {
        return new ProductSizeResponse(
                size.getId(),
                size.getSize(),
                size.getStockQuantity(),
                size.getAvailable()
        );
    }
}
