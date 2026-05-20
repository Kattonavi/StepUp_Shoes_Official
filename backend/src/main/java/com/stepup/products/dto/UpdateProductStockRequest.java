package com.stepup.products.dto;

import com.stepup.products.enums.StockStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateProductStockRequest(
        @NotNull(message = "stockStatus is required")
        StockStatus stockStatus,

        // optional: update individual size stock as well
        @Valid
        List<ProductSizeRequest> sizes
) {}
