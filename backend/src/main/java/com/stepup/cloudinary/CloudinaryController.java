package com.stepup.cloudinary;

import com.stepup.cloudinary.dto.DeleteAssetRequest;
import com.stepup.cloudinary.dto.DeleteAssetResponse;
import com.stepup.cloudinary.dto.SignUploadRequest;
import com.stepup.cloudinary.dto.SignUploadResponse;
import com.stepup.cloudinary.service.CloudinaryService;
import com.stepup.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints de Cloudinary, protegidos por sesión (cookie access_token).
 *
 * Se mueven al backend porque, en producción Railway, frontend y backend están
 * en dominios distintos. Las cookies httpOnly de sesión están atadas al dominio
 * del backend, así que el navegador NO las envía a una route Next del frontend.
 *
 * Estos endpoints sí reciben la cookie (mismo origen que el backend) y pueden
 * validar la sesión con el filtro JWT existente (que ya lee access_token cookie
 * o Authorization Bearer).
 *
 * Roles permitidos: SUPER_ADMIN, OWNER, ADMIN, EDITOR (VIEWER excluido).
 * El secreto de Cloudinary nunca abandona el backend.
 */
@RestController
@RequestMapping("/api/v1/cloudinary")
@RequiredArgsConstructor
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/sign")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR')")
    public ResponseEntity<ApiResponse<SignUploadResponse>> sign(
            @Valid @RequestBody(required = false) SignUploadRequest request) {

        String purpose = request != null ? request.purpose() : null;
        SignUploadResponse response = cloudinaryService.signUpload(purpose);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/delete")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR')")
    public ResponseEntity<ApiResponse<DeleteAssetResponse>> delete(
            @Valid @RequestBody DeleteAssetRequest request) {

        DeleteAssetResponse response = cloudinaryService.deleteAsset(request.publicId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
