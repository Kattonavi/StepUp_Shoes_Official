package com.stepup.products.dto;

import com.stepup.products.enums.ProductStatus;
import com.stepup.products.enums.StockStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateProductRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 255)
        String name,

        @Size(max = 255)
        String slug,

        String description,

        @NotNull(message = "Category is required")
        UUID categoryId,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price must be >= 0")
        BigDecimal price,

        @DecimalMin(value = "0.00", message = "Old price must be >= 0")
        BigDecimal oldPrice,

        @Min(value = 0, message = "Discount percentage must be between 0 and 100")
        @Max(value = 100, message = "Discount percentage must be between 0 and 100")
        Integer discountPercentage,

        ProductStatus status,

        StockStatus stockStatus,

        Boolean isNew,

        Boolean isOnSale,

        Boolean isFeatured,

        Boolean visible,

        @Size(max = 255)
        String seoTitle,

        @Size(max = 500)
        String seoDescription,

        Integer displayOrder,

        @Valid
        List<ProductImageRequest> images,

        @Valid
        List<ProductSizeRequest> sizes
) {}
