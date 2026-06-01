package com.stepup.auth;

import com.stepup.auth.dto.AuthUserResponse;
import com.stepup.auth.dto.LoginRequest;
import com.stepup.auth.dto.LoginResponse;
import com.stepup.auth.dto.LogoutRequest;
import com.stepup.auth.dto.RefreshTokenRequest;
import com.stepup.auth.service.AuthService;
import com.stepup.common.exception.InvalidTokenException;
import com.stepup.common.response.ApiResponse;
import com.stepup.common.security.CookieService;
import com.stepup.common.util.SecurityUtils;
import com.stepup.users.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Auth endpoints. La sesión vive en cookies httpOnly (access_token / refresh_token).
 *
 * Compatibilidad: login/refresh siguen devolviendo los tokens en el body para
 * clientes no-browser (Postman, tests, scripts). El frontend NUEVO no los usa:
 * confía exclusivamente en las cookies. refresh/logout aceptan el refresh token
 * desde la cookie (preferido) o desde el body (fallback de compatibilidad).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        LoginResponse response = authService.login(request, httpRequest);
        setSessionCookies(httpResponse, response.accessToken(), response.refreshToken());
        return ResponseEntity.ok(ApiResponse.ok(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String refreshToken = resolveRefreshToken(httpRequest, request != null ? request.refreshToken() : null);
        if (!StringUtils.hasText(refreshToken)) {
            clearSessionCookies(httpResponse);
            throw new InvalidTokenException("No refresh token provided");
        }

        try {
            LoginResponse response = authService.refresh(refreshToken, httpRequest);
            setSessionCookies(httpResponse, response.accessToken(), response.refreshToken());
            return ResponseEntity.ok(ApiResponse.ok(response, "Token refreshed"));
        } catch (RuntimeException ex) {
            // Refresh inválido/expirado/revocado → limpiar cookies para que el
            // navegador no reintente con credenciales muertas. Rethrow para que
            // el GlobalExceptionHandler emita el 401 con su body estándar.
            clearSessionCookies(httpResponse);
            throw ex;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) LogoutRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        String refreshToken = resolveRefreshToken(httpRequest, request != null ? request.refreshToken() : null);
        if (StringUtils.hasText(refreshToken)) {
            authService.logout(refreshToken, httpRequest);
        }
        // Siempre limpiar cookies, exista o no el refresh token.
        clearSessionCookies(httpResponse);
        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthUserResponse>> me() {
        User currentUser = SecurityUtils.requireCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(AuthUserResponse.from(currentUser)));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Refresh token desde cookie (preferido) o body (compat). */
    private String resolveRefreshToken(HttpServletRequest request, String bodyToken) {
        return cookieService.extractRefreshToken(request).orElse(bodyToken);
    }

    private void setSessionCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieService.buildAccessTokenCookie(accessToken).toString());
        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieService.buildRefreshTokenCookie(refreshToken).toString());
    }

    private void clearSessionCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieService.clearAccessTokenCookie().toString());
        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieService.clearRefreshTokenCookie().toString());
    }
}
