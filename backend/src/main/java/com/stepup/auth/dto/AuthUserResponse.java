package com.stepup.auth.dto;

import com.stepup.users.Role;
import com.stepup.users.User;
import com.stepup.users.UserStatus;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        UserStatus status
) {
    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus()
        );
    }
}
