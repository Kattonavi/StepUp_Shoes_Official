package com.stepup.messages.dto;

import com.stepup.messages.enums.MessageSource;
import com.stepup.messages.enums.MessageStatus;

import java.time.Instant;
import java.util.UUID;

public record MessageDetailResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String subject,
        String content,
        MessageSource source,
        MessageStatus status,
        UUID productId,
        String productName,
        String internalNotes,
        Instant createdAt,
        Instant updatedAt,
        Instant readAt,
        UUID readBy,
        Instant archivedAt,
        UUID archivedBy,
        Instant deletedAt
) {
}
