package com.stepup.settings;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// TODO(phase-6): Implementar configuración de la tienda.
// Requiere: entidad StoreSettings, SettingsService, SettingsRepository, DTOs, migración V10.
// Solo existe un único registro de configuración (singleton).

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    @GetMapping
    public ResponseEntity<String> getPublicSettings() {
        // TODO(phase-6): Retornar configuración pública de la tienda (public endpoint)
        // Incluye: nombre, logo, whatsapp, redes sociales, texto home, SEO global
        return ResponseEntity.ok("TODO(phase-6): GET /settings — not yet implemented");
    }

    @GetMapping("/admin")
    public ResponseEntity<String> getAdminSettings() {
        // TODO(phase-6): Retornar configuración completa (requiere auth OWNER+)
        return ResponseEntity.ok("TODO(phase-6): GET /settings/admin — not yet implemented");
    }

    @PutMapping
    public ResponseEntity<String> updateSettings() {
        // TODO(phase-6): Actualizar configuración de la tienda (requiere auth OWNER+)
        return ResponseEntity.ok("TODO(phase-6): PUT /settings — not yet implemented");
    }
}
