package com.stepup.settings;

import com.stepup.common.response.ApiResponse;
import com.stepup.settings.dto.PublicStoreSettingsResponse;
import com.stepup.settings.dto.StoreSettingsResponse;
import com.stepup.settings.dto.UpdateStoreSettingsRequest;
import com.stepup.settings.service.StoreSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final StoreSettingsService settingsService;

    /**
     * Public endpoint — returns safe store configuration for storefront.
     * Already listed in SecurityConfig PUBLIC_GET_ENDPOINTS.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PublicStoreSettingsResponse>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getPublicSettings()));
    }

    /**
     * Admin endpoint — returns full settings including internal fields.
     * Requires any authenticated admin user; OWNER+ to edit.
     */
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<StoreSettingsResponse>> getAdminSettings() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getAdminSettings()));
    }

    /**
     * Update store settings. Requires OWNER or SUPER_ADMIN.
     */
    @PutMapping
    public ResponseEntity<ApiResponse<StoreSettingsResponse>> updateSettings(
            @Valid @RequestBody UpdateStoreSettingsRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                settingsService.updateSettings(request),
                "Configuración actualizada correctamente"
        ));
    }
}
