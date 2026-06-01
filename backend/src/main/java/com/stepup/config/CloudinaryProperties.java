package com.stepup.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuración de Cloudinary (sign + destroy desde el backend).
 *
 * Los secretos viven SOLO en el backend, nunca en el frontend. El frontend
 * recibe del backend la firma temporal y el cloudName (necesario para construir
 * la URL pública de subida).
 *
 * Folders separados por dominio:
 *   - products    → {@code stepup/products}
 *   - promotions  → {@code stepup/promotions}
 *
 * El cliente elige el {@code purpose} (product|promotion); el servidor mapea
 * al folder real para evitar que el cliente escriba en folders arbitrarios.
 */
@ConfigurationProperties(prefix = "app.cloudinary")
@Data
public class CloudinaryProperties {

    /** Cloud name de Cloudinary (público — se devuelve al cliente). */
    private String cloudName = "";

    /** API key (necesaria en cliente como parámetro del upload firmado). */
    private String apiKey = "";

    /** API secret — JAMÁS se devuelve al cliente. */
    private String apiSecret = "";

    /** Folder para imágenes de producto. */
    private String productsFolder = "stepup/products";

    /** Folder para banners/imágenes de promociones. */
    private String promotionsFolder = "stepup/promotions";

    public boolean isConfigured() {
        return !cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank();
    }
}
