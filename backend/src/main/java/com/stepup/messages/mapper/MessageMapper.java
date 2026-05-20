package com.stepup.messages.mapper;

import com.stepup.messages.dto.MessageDetailResponse;
import com.stepup.messages.dto.MessageResponse;
import com.stepup.messages.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public MessageResponse toResponse(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getFullName(),
                m.getEmail(),
                m.getPhone(),
                m.getSubject(),
                m.getSource(),
                m.getStatus(),
                m.getProductId(),
                m.getProductName(),
                m.getCreatedAt(),
                m.getReadAt()
        );
    }

    public MessageDetailResponse toDetailResponse(Message m) {
        return new MessageDetailResponse(
                m.getId(),
                m.getFullName(),
                m.getEmail(),
                m.getPhone(),
                m.getSubject(),
                m.getContent(),
                m.getSource(),
                m.getStatus(),
                m.getProductId(),
                m.getProductName(),
                m.getInternalNotes(),
                m.getCreatedAt(),
                m.getUpdatedAt(),
                m.getReadAt(),
                m.getReadBy(),
                m.getArchivedAt(),
                m.getArchivedBy(),
                m.getDeletedAt()
        );
    }
}
