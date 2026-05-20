package com.stepup.categories;

import com.stepup.categories.dto.CategoryResponse;
import com.stepup.categories.dto.CreateCategoryRequest;
import com.stepup.categories.dto.UpdateCategoryRequest;
import com.stepup.categories.dto.UpdateCategoryStatusRequest;
import com.stepup.categories.service.CategoryService;
import com.stepup.common.response.ApiResponse;
import com.stepup.common.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Public: returns only active, non-deleted categories.
     * Admin (authenticated): can request includeInactive=true.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> listCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "position") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "false") boolean includeInactive,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        var pageable = PageRequest.of(page, size, sort);

        boolean isAuthenticated = SecurityUtils.isAuthenticated();
        Page<CategoryResponse> result;

        if (isAuthenticated && (includeInactive || includeDeleted)) {
            result = categoryService.listAdmin(includeDeleted, pageable);
        } else {
            result = categoryService.listPublic(pageable);
        }

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getById(id)));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getBySlug(slug)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Category created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.update(id, request), "Category updated"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCategoryStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.updateStatus(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        UUID currentUserId = SecurityUtils.requireCurrentUser().getId();
        categoryService.delete(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Category deleted"));
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> restoreCategory(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.restore(id), "Category restored"));
    }
}
