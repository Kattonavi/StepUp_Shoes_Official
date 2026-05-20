package com.stepup.audit.dto;

import jakarta.validation.constraints.Size;

public record RestoreRequest(
        @Size(max = 1000, message = "Reason must be under 1000 characters")
        String reason
) {}
