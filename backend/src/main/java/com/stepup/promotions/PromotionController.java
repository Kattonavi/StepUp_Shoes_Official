package com.stepup.promotions;

import com.stepup.common.response.ApiResponse;
import com.stepup.common.util.SecurityUtils;
import com.stepup.promotions.dto.CreatePromotionRequest;
import com.stepup.promotions.dto.PromotionResponse;
import com.stepup.promotions.dto.UpdatePromotionActiveRequest;
import com.stepup.promotions.dto.UpdatePromotionRequest;
import com.stepup.promotions.dto.UpdatePromotionVisibilityRequest;
import com.stepup.promotions.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.listAdmin()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PromotionResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PromotionResponse>> create(
            @Valid @RequestBody CreatePromotionRequest request) {
        UUID actorId = SecurityUtils.requireCurrentUser().getId();
        PromotionResponse response = promotionService.create(request, actorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Promotion created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PromotionResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePromotionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PromotionResponse>> toggleActive(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePromotionActiveRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.toggleActive(id, request.active())));
    }

    /**
     * Show or hide a promotion from the public home without touching `active`
     * nor deleting it. Used by the "biblioteca de presets" workflow.
     */
    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PromotionResponse>> toggleVisible(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePromotionVisibilityRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(promotionService.toggleVisible(id, request.visible())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        UUID actorId = SecurityUtils.requireCurrentUser().getId();
        promotionService.delete(id, actorId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Promotion deleted"));
    }
}
