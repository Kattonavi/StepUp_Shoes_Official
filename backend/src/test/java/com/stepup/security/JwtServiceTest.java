package com.stepup.security;

import com.stepup.config.JwtProperties;
import com.stepup.users.Role;
import com.stepup.users.User;
import com.stepup.users.UserStatus;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService Unit Tests")
class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret("test-secret-must-be-at-least-32-characters-long-for-hs256-algorithm");
        props.setAccessExpirationMinutes(15);
        props.setRefreshExpirationDays(7);

        jwtService = new JwtService(props);

        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@stepup.com")
                .fullName("Test User")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("generateAccessToken should produce a non-blank JWT")
    void generateAccessToken_returnsNonBlankToken() {
        String token = jwtService.generateAccessToken(testUser);
        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
    }

    @Test
    @DisplayName("extractUserId should return the user's UUID")
    void extractUserId_returnsCorrectId() {
        String token = jwtService.generateAccessToken(testUser);
        UUID extracted = jwtService.extractUserId(token);
        assertThat(extracted).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("extractEmail should return the user's email")
    void extractEmail_returnsCorrectEmail() {
        String token = jwtService.generateAccessToken(testUser);
        String email = jwtService.extractEmail(token);
        assertThat(email).isEqualTo("test@stepup.com");
    }

    @Test
    @DisplayName("extractRole should return the user's role name")
    void extractRole_returnsCorrectRole() {
        String token = jwtService.generateAccessToken(testUser);
        String role = jwtService.extractRole(token);
        assertThat(role).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("isTokenValid should return true for a freshly generated token")
    void isTokenValid_trueForFreshToken() {
        String token = jwtService.generateAccessToken(testUser);
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("isTokenValid should return false for a tampered token")
    void isTokenValid_falseForTamperedToken() {
        String token = jwtService.generateAccessToken(testUser);
        String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "invalidsignature";
        assertThat(jwtService.isTokenValid(tampered)).isFalse();
    }

    @Test
    @DisplayName("isTokenValid should return false for a blank token")
    void isTokenValid_falseForBlankToken() {
        assertThat(jwtService.isTokenValid("")).isFalse();
        assertThat(jwtService.isTokenValid("not.a.jwt")).isFalse();
    }

    @Test
    @DisplayName("constructor should reject secret shorter than 32 characters")
    void constructor_rejectsShortSecret() {
        JwtProperties shortProps = new JwtProperties();
        shortProps.setSecret("tooshort");
        shortProps.setAccessExpirationMinutes(15);

        assertThatThrownBy(() -> new JwtService(shortProps))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 characters");
    }

    @Test
    @DisplayName("extractAllClaims should contain expected custom claims")
    void extractAllClaims_containsCustomClaims() {
        String token = jwtService.generateAccessToken(testUser);
        Claims claims = jwtService.extractAllClaims(token);

        assertThat(claims.getSubject()).isEqualTo(testUser.getId().toString());
        assertThat(claims.get("email", String.class)).isEqualTo("test@stepup.com");
        assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
        assertThat(claims.getIssuedAt()).isNotNull();
        assertThat(claims.getExpiration()).isNotNull();
    }
}
