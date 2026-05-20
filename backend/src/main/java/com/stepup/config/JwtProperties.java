package com.stepup.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
@Data
public class JwtProperties {

    /** Secreto para firmar tokens. Mínimo 32 caracteres (256 bits). En prod usar 64+. */
    private String secret;

    /** Duración del access token en minutos. Default: 15. */
    private long accessExpirationMinutes = 15;

    /** Duración del refresh token en días. Default: 7. */
    private long refreshExpirationDays = 7;
}
