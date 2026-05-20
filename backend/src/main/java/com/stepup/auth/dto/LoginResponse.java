package com.stepup.auth.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        long expiresInSeconds,
        AuthUserResponse user
) {}
