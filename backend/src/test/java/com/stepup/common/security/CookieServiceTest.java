package com.stepup.common.security;

import com.stepup.config.CookieProperties;
import com.stepup.config.JwtProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseCookie;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("CookieService Unit Tests")
class CookieServiceTest {

    private CookieService cookieService;
    private CookieProperties cookieProps;

    @BeforeEach
    void setUp() {
        cookieProps = new CookieProperties();
        // Production-ish defaults (Railway cross-site).
        cookieProps.setSecure(true);
        cookieProps.setSameSite("None");
        cookieProps.setDomain("");
        cookieProps.setAccessName("access_token");
        cookieProps.setRefreshName("refresh_token");
        cookieProps.setPath("/");

        JwtProperties jwtProps = new JwtProperties();
        jwtProps.setSecret("test-secret-please-do-not-use-in-production-must-be-32-bytes-min");
        jwtProps.setAccessExpirationMinutes(15);
        jwtProps.setRefreshExpirationDays(7);

        cookieService = new CookieService(cookieProps, jwtProps);
    }

    @Test
    @DisplayName("access cookie carries Secure, HttpOnly, SameSite=None, Path=/, JWT-length maxAge")
    void accessCookieHasSecureAttributesAndMaxAge() {
        ResponseCookie cookie = cookieService.buildAccessTokenCookie("abc.def.ghi");

        assertThat(cookie.getName()).isEqualTo("access_token");
        assertThat(cookie.getValue()).isEqualTo("abc.def.ghi");
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.isSecure()).isTrue();
        assertThat(cookie.getSameSite()).isEqualTo("None");
        assertThat(cookie.getPath()).isEqualTo("/");
        assertThat(cookie.getMaxAge().toMinutes()).isEqualTo(15);
        // Header form: Secure + HttpOnly + SameSite=None must all be present.
        String header = cookie.toString();
        assertThat(header).contains("Secure").contains("HttpOnly").contains("SameSite=None");
    }

    @Test
    @DisplayName("refresh cookie maxAge = JWT refresh days (7d)")
    void refreshCookieMaxAgeMatchesJwtRefreshDays() {
        ResponseCookie cookie = cookieService.buildRefreshTokenCookie("opaque-refresh");
        assertThat(cookie.getName()).isEqualTo("refresh_token");
        assertThat(cookie.getMaxAge().toDays()).isEqualTo(7);
    }

    @Test
    @DisplayName("clear cookies use same attributes with maxAge=0 so the browser deletes them")
    void clearCookiesHaveMaxAgeZero() {
        ResponseCookie cleared = cookieService.clearAccessTokenCookie();
        assertThat(cleared.getName()).isEqualTo("access_token");
        assertThat(cleared.getValue()).isEmpty();
        assertThat(cleared.getMaxAge().getSeconds()).isZero();
        assertThat(cleared.isSecure()).isTrue();
        assertThat(cleared.getSameSite()).isEqualTo("None");
        assertThat(cleared.getPath()).isEqualTo("/");

        ResponseCookie clearedRefresh = cookieService.clearRefreshTokenCookie();
        assertThat(clearedRefresh.getMaxAge().getSeconds()).isZero();
        assertThat(clearedRefresh.getName()).isEqualTo("refresh_token");
    }

    @Test
    @DisplayName("local profile (secure=false, sameSite=Lax) reflects in headers")
    void localProfileCookieAttributes() {
        cookieProps.setSecure(false);
        cookieProps.setSameSite("Lax");

        ResponseCookie cookie = cookieService.buildAccessTokenCookie("token");
        assertThat(cookie.isSecure()).isFalse();
        assertThat(cookie.getSameSite()).isEqualTo("Lax");
        assertThat(cookie.toString()).contains("SameSite=Lax").doesNotContain("Secure;");
    }

    @Test
    @DisplayName("domain is added only when non-empty")
    void domainAppliedOnlyWhenSet() {
        cookieProps.setDomain("");
        assertThat(cookieService.buildAccessTokenCookie("t").getDomain()).isNull();

        cookieProps.setDomain("example.com");
        assertThat(cookieService.buildAccessTokenCookie("t").getDomain()).isEqualTo("example.com");
    }

    @Test
    @DisplayName("extract returns the requested cookie value, ignores empty/missing")
    void extractReadsCookiesFromRequest() {
        HttpServletRequest req = mock(HttpServletRequest.class);

        when(req.getCookies()).thenReturn(null);
        assertThat(cookieService.extractAccessToken(req)).isEmpty();

        when(req.getCookies()).thenReturn(new Cookie[]{
                new Cookie("other", "x"),
                new Cookie("access_token", "abc"),
                new Cookie("refresh_token", "def"),
        });
        assertThat(cookieService.extractAccessToken(req)).contains("abc");
        assertThat(cookieService.extractRefreshToken(req)).contains("def");
        assertThat(cookieService.extractCookie(req, "missing")).isEmpty();

        // Empty value is treated as absent.
        when(req.getCookies()).thenReturn(new Cookie[]{new Cookie("access_token", "")});
        assertThat(cookieService.extractAccessToken(req)).isEmpty();
    }
}
