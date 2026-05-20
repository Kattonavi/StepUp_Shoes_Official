package com.stepup.products;

import com.stepup.common.response.ApiResponse;
import com.stepup.common.util.SecurityUtils;
import com.stepup.products.dto.CreateProductRequest;
import com.stepup.products.dto.ProductResponse;
import com.stepup.products.dto.ProductSummaryResponse;
import com.stepup.products.dto.UpdateProductRequest;
import com.stepup.products.dto.UpdateProductStatusRequest;
import com.stepup.products.dto.UpdateProductStockRequest;
import com.stepup.products.dto.UpdateProductVisibilityRequest;
import com.stepup.products.enums.StockStatus;
import com.stepup.products.service.ProductService;
import com.stepup.users.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * Public catalog. Returns ACTIVE + visible + non-deleted products.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductSummaryResponse>>> listProducts(
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) StockStatus stockStatus,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) Boolean isOnSale,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size);
        Page<ProductSummaryResponse> result = productService.listPublic(
                categorySlug, search, minPrice, maxPrice, stockStatus,
                isNew, isOnSale, isFeatured, sort, pageable);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Admin list: includes DRAFT/HIDDEN. Deleted excluded by default.
     * OWNER/SUPER_ADMIN may pass includeDeleted=true.
     */
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<ProductSummaryResponse>>> listProductsAdmin(
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        boolean canSeeDeleted = includeDeleted && isOwnerOrAbove();
        var pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ok(productService.listAdmin(canSeeDeleted, pageable)));
    }

    /**
     * Public: visible + ACTIVE only. Admin: any non-deleted.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable UUID id) {
        if (SecurityUtils.isAuthenticated()) {
            return ResponseEntity.ok(ApiResponse.ok(productService.getAdminById(id)));
        }
        return ResponseEntity.ok(ApiResponse.ok(productService.getPublicById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getBySlug(slug)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Product created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.update(id, request), "Product updated"));
    }

    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateVisibility(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductVisibilityRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.updateVisibility(id, request)));
    }

    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('EDITOR', 'ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductStockRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.updateStock(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.updateStatus(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.requireCurrentUser().getId();
        productService.delete(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Product deleted"));
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> restoreProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.restore(id), "Product restored"));
    }

    private boolean isOwnerOrAbove() {
        return SecurityUtils.getCurrentUser()
                .map(u -> u.getRole() == Role.OWNER || u.getRole() == Role.SUPER_ADMIN)
                .orElse(false);
    }
}
