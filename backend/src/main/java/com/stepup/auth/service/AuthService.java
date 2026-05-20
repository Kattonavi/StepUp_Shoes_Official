package com.stepup.auth.service;

import com.stepup.auth.RefreshToken;
import com.stepup.auth.RefreshTokenRepository;
import com.stepup.auth.dto.AuthUserResponse;
import com.stepup.auth.dto.LoginRequest;
import com.stepup.auth.dto.LoginResponse;
import com.stepup.common.exception.InvalidTokenException;
import com.stepup.common.exception.UserNotActiveException;
import com.stepup.common.util.HashUtils;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        StepUpUserDetails userDetails = (StepUpUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        if (!user.isActive()) {
            throw new UserNotActiveException("Account is not active. Status: " + user.getStatus());
        }

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

    @Transactional
    public LoginResponse refresh(String plainRefreshToken, HttpServletRequest httpRequest) {
        String tokenHash = HashUtils.sha256(plainRefreshToken);

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found or already used"));

        if (stored.isRevoked()) {
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
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
