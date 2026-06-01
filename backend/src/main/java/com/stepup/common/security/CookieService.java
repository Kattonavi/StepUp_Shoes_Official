package com.stepup.common.security;

import com.stepup.config.CookieProperties;
import com.stepup.config.JwtProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.util.Optional;

/**
 * Centraliza la construcción y lectura de las cookies httpOnly de sesión.
 *
 * Toda la política (secure, sameSite, domain, path, nombres, maxAge) vive aquí
 * para que el controller no la duplique y para que las cookies de "clear" usen
 * EXACTAMENTE los mismos atributos que las de "set" (requisito para que el
 * navegador las borre correctamente).
 */
@Service
@RequiredArgsConstructor
public class CookieService {

    private final CookieProperties cookieProps;
    private final JwtProperties jwtProps;

    // ─── Build (set) ────────────────────────────────────────────────────────

    /** Cookie del access token. maxAge = expiración del JWT de acceso. */
    public ResponseCookie buildAccessTokenCookie(String token) {
        return base(cookieProps.getAccessName(), token)
                .maxAge(Duration.ofMinutes(jwtProps.getAccessExpirationMinutes()))
                .build();
    }

    /** Cookie del refresh token. maxAge = expiración del refresh token. */
    public ResponseCookie buildRefreshTokenCookie(String token) {
        return base(cookieProps.getRefreshName(), token)
                .maxAge(Duration.ofDays(jwtProps.getRefreshExpirationDays()))
                .build();
    }

    // ─── Clear ────────────────────────────────────────────────────────────────

    /** Cookie vacía con maxAge=0 para borrar el access token. */
    public ResponseCookie clearAccessTokenCookie() {
        return base(cookieProps.getAccessName(), "").maxAge(0).build();
    }

    /** Cookie vacía con maxAge=0 para borrar el refresh token. */
    public ResponseCookie clearRefreshTokenCookie() {
        return base(cookieProps.getRefreshName(), "").maxAge(0).build();
    }

    // ─── Read ───────────────────────────────────────────────────────────────

    public Optional<String> extractAccessToken(HttpServletRequest request) {
        return extractCookie(request, cookieProps.getAccessName());
    }

    public Optional<String> extractRefreshToken(HttpServletRequest request) {
        return extractCookie(request, cookieProps.getRefreshName());
    }

    public Optional<String> extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        for (Cookie c : request.getCookies()) {
            if (name.equals(c.getName()) && StringUtils.hasText(c.getValue())) {
                return Optional.of(c.getValue());
            }
        }
        return Optional.empty();
    }

    public String getAccessCookieName() {
        return cookieProps.getAccessName();
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    private ResponseCookie.ResponseCookieBuilder base(String name, String value) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieProps.isSecure())
                .sameSite(cookieProps.getSameSite())
                .path(cookieProps.getPath());
        if (StringUtils.hasText(cookieProps.getDomain())) {
            builder.domain(cookieProps.getDomain());
        }
        return builder;
    }
}
