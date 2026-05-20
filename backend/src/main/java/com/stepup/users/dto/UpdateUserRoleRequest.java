package com.stepup.users.dto;

import com.stepup.users.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(
        @NotNull(message = "Role is required")
        Role role
) {}
