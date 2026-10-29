package com.stepup.auth.service;

import com.stepup.auth.RefreshToken;
import com.stepup.auth.RefreshTokenRepository;
import com.stepup.auth.dto.AuthUserResponse;
import com.stepup.auth.dto.LoginRequest;
import com.stepup.auth.dto.LoginResponse;
import com.stepup.common.exception.InvalidTokenException;
import com.stepup.common.exception.RateLimitExceededException;
import com.stepup.common.exception.UserNotActiveException;
import com.stepup.common.security.RateLimitService;
import com.stepup.common.util.HashUtils;
import com.stepup.common.util.RequestUtils;
import com.stepup.config.JwtProperties;
import com.stepup.security.JwtService;
import com.stepup.security.StepUpUserDetails;
import com.stepup.users.User;
import com.stepup.users.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final Duration REUSE_GRACE = Duration.ofSeconds(30);

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RateLimitService rateLimitService;

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        // Rate-limit key combines ipHash + emailHash so attackers can't sweep many
        // emails from one IP, and can't hammer one email from many IPs without
        // each IP showing up as a distinct key.
        String key = buildLoginKey(httpRequest, request.email());
        String emailKey = emailHash(request.email());
        if (!rateLimitService.check(RateLimitService.Endpoint.LOGIN, key)
                || !rateLimitService.check(RateLimitService.Endpoint.LOGIN_EMAIL, emailKey)) {
            log.warn("Login rate-limit exceeded for ipHash={}",
                    RequestUtils.getClientIpHashOrUnknown(httpRequest));
            throw new RateLimitExceededException(
                    "Demasiados intentos de inicio de sesión. Intenta nuevamente más tarde.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (AuthenticationException ex) {
            // Failed attempt — counter already incremented above. Let Spring's
            // BadCredentialsException flow through GlobalExceptionHandler so the
            // client still sees a generic 401.
            throw ex;
        }

        StepUpUserDetails userDetails = (StepUpUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (!user.isActive()) {
            throw new UserNotActiveException("Account is not active. Status: " + user.getStatus());
        }

        // Successful login — clear the counter so legitimate users aren't
        // locked out by their own earlier typos.
        rateLimitService.reset(RateLimitService.Endpoint.LOGIN, key);
        rateLimitService.reset(RateLimitService.Endpoint.LOGIN_EMAIL, emailKey);

        userRepository.updateLastLoginAt(user.getId());

        String accessToken = jwtService.generateAccessToken(user);
        String plainRefreshToken = HashUtils.generateSecureToken();
        String tokenHash = HashUtils.sha256(plainRefreshToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plusSeconds(jwtProperties.getRefreshExpirationDays() * 86400))
                .createdByIp(extractIp(httpRequest))
                .userAgent(httpRequest.getHeader("User-Agent"))
                .build();

        refreshTokenRepository.save(refreshToken);

        log.info("User logged in: {}", user.getEmail());

        return new LoginResponse(
                accessToken,
                plainRefreshToken,
                jwtService.getAccessExpirationSeconds(),
                AuthUserResponse.from(user)
        );
    }

    private String buildLoginKey(HttpServletRequest request, String email) {
        return RequestUtils.getClientIpHashOrUnknown(request) + ":" + emailHash(email);
    }

    private static String emailHash(String email) {
        return email == null ? "anon" : HashUtils.sha256(email.trim().toLowerCase());
    }

    // noRollbackFor: the reuse-detection revocation below must commit even though we then throw.
    @Transactional(noRollbackFor = InvalidTokenException.class)
    public LoginResponse refresh(String plainRefreshToken, HttpServletRequest httpRequest) {
        String tokenHash = HashUtils.sha256(plainRefreshToken);

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found or already used"));

        if (stored.isRevoked()) {
            // A rotated token presented again after the grace window means it was
            // likely stolen: kill every session of that user. The grace window covers
            // two browser tabs refreshing with the same cookie at the same time.
            if (stored.getRevokedAt().isBefore(Instant.now().minus(REUSE_GRACE))) {
                int revoked = refreshTokenRepository.revokeAllActiveByUserId(
                        stored.getUser().getId(), Instant.now());
                log.warn("Refresh token reuse detected for user {} — revoked {} active sessions",
                        stored.getUser().getId(), revoked);
            }
            throw new InvalidTokenException("Refresh token has been revoked");
        }
        if (stored.isExpired()) {
            throw new InvalidTokenException("Refresh token has expired. Please log in again.");
        }

        User user = stored.getUser();

        if (!user.isActive()) {
            throw new UserNotActiveException("Account is not active. Status: " + user.getStatus());
        }

        // Rotation: revocar el token actual y emitir uno nuevo
        refreshTokenRepository.revokeByTokenHash(tokenHash, Instant.now(), extractIp(httpRequest));

        String newAccessToken = jwtService.generateAccessToken(user);
        String newPlainRefresh = HashUtils.generateSecureToken();
        String newHash = HashUtils.sha256(newPlainRefresh);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(newHash)
                .expiresAt(Instant.now().plusSeconds(jwtProperties.getRefreshExpirationDays() * 86400))
                .createdByIp(extractIp(httpRequest))
                .userAgent(httpRequest.getHeader("User-Agent"))
                .build();

        refreshTokenRepository.save(newRefreshToken);

        return new LoginResponse(
                newAccessToken,
                newPlainRefresh,
                jwtService.getAccessExpirationSeconds(),
                AuthUserResponse.from(user)
        );
    }

    @Transactional
    public void logout(String plainRefreshToken, HttpServletRequest httpRequest) {
        String tokenHash = HashUtils.sha256(plainRefreshToken);
        int revoked = refreshTokenRepository.revokeByTokenHash(
                tokenHash, Instant.now(), extractIp(httpRequest));
        if (revoked == 0) {
            log.debug("Logout attempted with unknown or already revoked token");
        }
    }

    private String extractIp(HttpServletRequest request) {
        return RequestUtils.getClientIpHash(request);
    }
}
