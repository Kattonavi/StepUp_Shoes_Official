package com.stepup.users.dto;

import com.stepup.users.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull(message = "Status is required")
        UserStatus status
) {}
