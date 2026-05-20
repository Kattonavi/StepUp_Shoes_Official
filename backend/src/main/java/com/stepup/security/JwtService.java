package com.stepup.security;

import com.stepup.config.JwtProperties;
import com.stepup.users.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@Slf4j
public class JwtService {

    private final SecretKey signingKey;
    private final long accessExpirationMinutes;

    public JwtService(JwtProperties props) {
        if (props.getSecret() == null || props.getSecret().isBlank()) {
            throw new IllegalStateException("app.security.jwt.secret must not be empty");
        }
        byte[] keyBytes = props.getSecret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must be at least 32 characters (256 bits). Current length: " + keyBytes.length);
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessExpirationMinutes = props.getAccessExpirationMinutes();
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(accessExpirationMinutes * 60);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(signingKey)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(extractAllClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return (String) extractAllClaims(token).get("email");
    }

    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    /**
     * Valida el token y retorna true si es válido.
     * Loggea el motivo si falla, pero no lanza excepción.
     */
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("JWT token expired");
        } catch (MalformedJwtException | UnsupportedJwtException e) {
            log.debug("JWT token malformed or unsupported");
        } catch (SecurityException e) {
            log.debug("JWT signature invalid");
        } catch (IllegalArgumentException e) {
            log.debug("JWT token empty or null");
        }
        return false;
    }

    public long getAccessExpirationSeconds() {
        return accessExpirationMinutes * 60;
    }
}
