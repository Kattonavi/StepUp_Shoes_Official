package com.stepup.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuración de las cookies de sesión (access/refresh tokens).
 *
 * Cross-site (frontend y backend en dominios distintos, p.ej. Railway):
 *   secure=true, sameSite=None  → el navegador envía las cookies en peticiones
 *   cross-origin solo sobre HTTPS. Requiere CORS allowCredentials=true y un
 *   Origin explícito (no "*").
 *
 * Local (http://localhost:3000 → http://localhost:8080):
 *   secure=false, sameSite=Lax  → Secure=true rompería las cookies sobre http.
 *
 * Los nombres de cookie son configurables para no acoplar el frontend a valores
 * fijos. `domain` vacío = cookie host-only (recomendado en cross-site).
 */
@ConfigurationProperties(prefix = "app.security.cookie")
@Data
public class CookieProperties {

    /** Secure flag. true en producción (HTTPS). false en local http. */
    private boolean secure = true;

    /** SameSite policy: "None" (cross-site), "Lax" (local), o "Strict". */
    private String sameSite = "None";

    /** Domain opcional. Vacío = host-only cookie (lo normal en cross-site). */
    private String domain = "";

    /** Nombre de la cookie del access token. */
    private String accessName = "access_token";

    /** Nombre de la cookie del refresh token. */
    private String refreshName = "refresh_token";

    /** Path de ambas cookies. "/" simplifica clear y evita mismatches. */
    private String path = "/";
}
