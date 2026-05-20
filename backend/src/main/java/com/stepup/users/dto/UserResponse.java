package com.stepup.users.dto;

import com.stepup.users.Role;
import com.stepup.users.User;
import com.stepup.users.UserStatus;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        UserStatus status,
        Instant lastLoginAt,
        Instant blockedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                user.getLastLoginAt(),
                user.getBlockedAt(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
