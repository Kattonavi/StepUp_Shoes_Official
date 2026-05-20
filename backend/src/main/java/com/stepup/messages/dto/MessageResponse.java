package com.stepup.messages.dto;

import com.stepup.messages.enums.MessageSource;
import com.stepup.messages.enums.MessageStatus;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String subject,
        MessageSource source,
        MessageStatus status,
        UUID productId,
        String productName,
        Instant createdAt,
        Instant readAt
) {
}
