package com.stepup.storefront;

import com.stepup.common.response.ApiResponse;
import com.stepup.storefront.dto.StorefrontEventRequest;
import com.stepup.storefront.service.StorefrontEventService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint público de eventos del storefront.
 *
 * Ruta /api/v1/storefront-events — nombre resistente a adblock (a diferencia
 * de /analytics/events, que algunas extensiones bloquean).
 *
 * No requiere auth. Fire-and-forget: siempre responde 200/success aunque el
 * registro se descarte (rate-limit, error interno), para no afectar la UX.
 */
@RestController
@RequestMapping("/api/v1/storefront-events")
@RequiredArgsConstructor
public class StorefrontEventController {

    private final StorefrontEventService storefrontEventService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> track(
            @Valid @RequestBody StorefrontEventRequest request,
            HttpServletRequest httpRequest) {

        storefrontEventService.track(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok(null, "tracked"));
    }
}
