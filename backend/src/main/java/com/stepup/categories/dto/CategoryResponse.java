package com.stepup.categories.dto;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String slug,
        String icon,
        String description,
        Integer position,
        Boolean active,
        Instant createdAt,
        Instant updatedAt,
        Instant deletedAt
) {}
