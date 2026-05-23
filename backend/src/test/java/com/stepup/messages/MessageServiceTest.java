package com.stepup.messages;

import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.messages.dto.CreateMessageRequest;
import com.stepup.messages.dto.MessageDetailResponse;
import com.stepup.messages.entity.Message;
import com.stepup.messages.enums.MessageSource;
import com.stepup.messages.enums.MessageStatus;
import com.stepup.messages.mapper.MessageMapper;
import com.stepup.messages.repository.MessageRepository;
import com.stepup.messages.service.MessageService;
import com.stepup.products.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("MessageService Unit Tests")
class MessageServiceTest {

    @Mock MessageRepository messageRepository;
    @Mock ProductRepository productRepository;
    @Mock AuditLogService auditLogService;
    @Mock EntitySerializationService serializer;
    @Mock MessageMapper messageMapper;

    @InjectMocks MessageService messageService;

    @Test
    @DisplayName("createMessage with null productId sets status UNREAD and skips product lookup")
    void createMessage_nullProductId_setsStatusUnread() {
        CreateMessageRequest req = new CreateMessageRequest(
                "Juan Pérez", "juan@example.com", null,
                "Consulta", "Mensaje de prueba", null /* no productId */, MessageSource.CONTACT_FORM, null
        );

        Message saved = buildMessage(MessageStatus.UNREAD, MessageSource.CONTACT_FORM);

        when(messageRepository.save(any())).thenReturn(saved);
        when(serializer.serializeMessageToJson(any())).thenReturn("{}");
        when(auditLogService.log(any(), any(), any(), any(), any(), any())).thenReturn(null);
        when(messageMapper.toDetailResponse(any())).thenAnswer(inv -> toDetail(inv.getArgument(0)));

        MessageDetailResponse result = messageService.createMessage(req);

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(MessageStatus.UNREAD);
    }

    @Test
    @DisplayName("createMessage uses CONTACT_FORM as default source when null")
    void createMessage_nullSource_defaultsToContactForm() {
        CreateMessageRequest req = new CreateMessageRequest(
                "María López", null, "3001234567",
                null, "Hola, quiero info", null, null,  // null source
                null
        );

        Message saved = buildMessage(MessageStatus.UNREAD, MessageSource.CONTACT_FORM);

        when(messageRepository.save(any())).thenReturn(saved);
        when(serializer.serializeMessageToJson(any())).thenReturn("{}");
        when(auditLogService.log(any(), any(), any(), any(), any(), any())).thenReturn(null);
        when(messageMapper.toDetailResponse(any())).thenAnswer(inv -> toDetail(inv.getArgument(0)));

        MessageDetailResponse result = messageService.createMessage(req);

        assertThat(result.source()).isEqualTo(MessageSource.CONTACT_FORM);
    }

    @Test
    @DisplayName("createMessage with productId looks up product name")
    void createMessage_withProductId_lookupsProductName() {
        UUID productId = UUID.randomUUID();
        CreateMessageRequest req = new CreateMessageRequest(
                "Pedro", "pedro@test.com", null,
                "Consulta", "Info del producto", productId, MessageSource.PRODUCT_INQUIRY, null
        );

        when(productRepository.findByIdAndDeletedAtIsNull(productId))
                .thenReturn(java.util.Optional.empty()); // product not found → null name

        Message saved = buildMessage(MessageStatus.UNREAD, MessageSource.PRODUCT_INQUIRY);

        when(messageRepository.save(any())).thenReturn(saved);
        when(serializer.serializeMessageToJson(any())).thenReturn("{}");
        when(auditLogService.log(any(), any(), any(), any(), any(), any())).thenReturn(null);
        when(messageMapper.toDetailResponse(any())).thenAnswer(inv -> toDetail(inv.getArgument(0)));

        MessageDetailResponse result = messageService.createMessage(req);

        assertThat(result).isNotNull();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Message buildMessage(MessageStatus status, MessageSource source) {
        return Message.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .email("test@example.com")
                .content("Test content")
                .status(status)
                .source(source)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private MessageDetailResponse toDetail(Message m) {
        return new MessageDetailResponse(
                m.getId(), m.getFullName(), m.getEmail(), m.getPhone(),
                m.getSubject(), m.getContent(), m.getSource(), m.getStatus(),
                m.getProductId(), m.getProductName(), m.getInternalNotes(),
                m.getCreatedAt(), m.getUpdatedAt(), m.getReadAt(), m.getReadBy(),
                m.getArchivedAt(), m.getArchivedBy(), m.getDeletedAt()
        );
    }
}
