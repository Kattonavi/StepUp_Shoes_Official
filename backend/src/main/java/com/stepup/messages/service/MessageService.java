package com.stepup.messages.service;

import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.common.exception.ResourceNotFoundException;
import com.stepup.common.util.SecurityUtils;
import com.stepup.messages.dto.CreateMessageRequest;
import com.stepup.messages.dto.MessageDetailResponse;
import com.stepup.messages.dto.MessageResponse;
import com.stepup.messages.dto.UnreadCountResponse;
import com.stepup.messages.dto.UpdateMessageNotesRequest;
import com.stepup.messages.entity.Message;
import com.stepup.messages.enums.MessageSource;
import com.stepup.messages.enums.MessageStatus;
import com.stepup.messages.mapper.MessageMapper;
import com.stepup.messages.repository.MessageRepository;
import com.stepup.messages.repository.MessageSpecification;
import com.stepup.products.repository.ProductRepository;
import com.stepup.users.Role;
import com.stepup.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {

    private final MessageRepository messageRepository;
    private final ProductRepository productRepository;
    private final MessageMapper messageMapper;
    private final AuditLogService auditLogService;
    private final EntitySerializationService serializer;

    // ─── Public: create message (no auth required) ───────────────────────────

    public MessageDetailResponse createMessage(CreateMessageRequest req) {
        String productName = null;
        if (req.productId() != null) {
            productName = productRepository.findByIdAndDeletedAtIsNull(req.productId())
                    .map(p -> p.getName())
                    .orElse(null);
        }

        Message message = Message.builder()
                .fullName(req.fullName())
                .email(req.email())
                .phone(req.phone())
                .subject(req.subject())
                .content(req.content())
                .productId(req.productId())
                .productName(productName)
                .source(req.source() != null ? req.source() : MessageSource.CONTACT_FORM)
                .status(MessageStatus.UNREAD)
                .build();

        message = messageRepository.save(message);

        auditLogService.log(
                AuditAction.CREATE,
                AuditableEntityType.MESSAGE,
                message.getId(),
                "Nuevo mensaje de " + message.getFullName(),
                null,
                serializer.serializeMessageToJson(message)
        );

        return messageMapper.toDetailResponse(message);
    }

    // ─── Admin: list messages ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<MessageResponse> listMessages(
            MessageStatus status,
            MessageSource source,
            String search,
            UUID productId,
            Instant from,
            Instant to,
            boolean includeDeleted,
            int page,
            int size
    ) {
        requireAdminAccess();

        // Only SUPER_ADMIN and OWNER can see deleted messages
        boolean canSeeDeleted = includeDeleted && hasRole(Role.OWNER);

        Specification<Message> spec = MessageSpecification.buildFilter(
                status, source, search, productId, from, to, canSeeDeleted
        );

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return messageRepository.findAll(spec, pageable).map(messageMapper::toResponse);
    }

    // ─── Admin: get message detail ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MessageDetailResponse getMessage(UUID id) {
        requireAdminAccess();
        Message message = findActive(id);
        return messageMapper.toDetailResponse(message);
    }

    // ─── Admin: mark read ─────────────────────────────────────────────────────

    public MessageDetailResponse markRead(UUID id) {
        requireManageAccess();
        Message message = findActive(id);

        if (message.getStatus() == MessageStatus.READ) {
            return messageMapper.toDetailResponse(message);
        }

        String before = serializer.serializeMessageToJson(message);
        message.setStatus(MessageStatus.READ);
        message.setReadAt(Instant.now());
        message.setReadBy(currentUserId());
        message = messageRepository.save(message);

        auditLogService.log(
                AuditAction.STATUS_CHANGE,
                AuditableEntityType.MESSAGE,
                message.getId(),
                "Mensaje marcado como leído",
                before,
                serializer.serializeMessageToJson(message)
        );

        return messageMapper.toDetailResponse(message);
    }

    // ─── Admin: mark unread ───────────────────────────────────────────────────

    public MessageDetailResponse markUnread(UUID id) {
        requireManageAccess();
        Message message = findActive(id);

        if (message.getStatus() == MessageStatus.UNREAD) {
            return messageMapper.toDetailResponse(message);
        }

        String before = serializer.serializeMessageToJson(message);
        message.setStatus(MessageStatus.UNREAD);
        message.setReadAt(null);
        message.setReadBy(null);
        message = messageRepository.save(message);

        auditLogService.log(
                AuditAction.STATUS_CHANGE,
                AuditableEntityType.MESSAGE,
                message.getId(),
                "Mensaje marcado como no leído",
                before,
                serializer.serializeMessageToJson(message)
        );

        return messageMapper.toDetailResponse(message);
    }

    // ─── Admin: archive ───────────────────────────────────────────────────────

    public MessageDetailResponse archiveMessage(UUID id) {
        requireManageAccess();
        Message message = findActive(id);

        if (message.getStatus() == MessageStatus.ARCHIVED) {
            return messageMapper.toDetailResponse(message);
        }

        String before = serializer.serializeMessageToJson(message);
        message.setStatus(MessageStatus.ARCHIVED);
        message.setArchivedAt(Instant.now());
        message.setArchivedBy(currentUserId());
        message = messageRepository.save(message);

        auditLogService.log(
                AuditAction.STATUS_CHANGE,
                AuditableEntityType.MESSAGE,
                message.getId(),
                "Mensaje archivado",
                before,
                serializer.serializeMessageToJson(message)
        );

        return messageMapper.toDetailResponse(message);
    }

    // ─── Admin: update internal notes ─────────────────────────────────────────

    public MessageDetailResponse updateNotes(UUID id, UpdateMessageNotesRequest req) {
        requireManageAccess();
        Message message = findActive(id);

        String before = serializer.serializeMessageToJson(message);
        message.setInternalNotes(req.internalNotes());
        message = messageRepository.save(message);

        auditLogService.log(
                AuditAction.UPDATE,
                AuditableEntityType.MESSAGE,
                message.getId(),
                "Notas internas actualizadas",
                before,
                serializer.serializeMessageToJson(message)
        );

        return messageMapper.toDetailResponse(message);
    }

    // ─── Admin: soft delete ───────────────────────────────────────────────────

    public void deleteMessage(UUID id) {
        requireOwnerAccess();
        Message message = findActive(id);

        String before = serializer.serializeMessageToJson(message);
        message.setStatus(MessageStatus.DELETED);
        message.setDeletedAt(Instant.now());
        message.setDeletedBy(currentUserId());
        messageRepository.save(message);

        auditLogService.log(
                AuditAction.SOFT_DELETE,
                AuditableEntityType.MESSAGE,
                message.getId(),
                "Mensaje eliminado",
                before,
                null
        );
    }

    // ─── Admin: restore ───────────────────────────────────────────────────────

    public MessageDetailResponse restoreMessage(UUID id) {
        requireOwnerAccess();
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));

        if (message.getDeletedAt() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El mensaje no está eliminado");
        }

        String before = serializer.serializeMessageToJson(message);
        message.setStatus(MessageStatus.ARCHIVED);  // safe status on restore
        message.setDeletedAt(null);
        message.setDeletedBy(null);
        message = messageRepository.save(message);

        auditLogService.log(
                AuditAction.RESTORE,
                AuditableEntityType.MESSAGE,
                message.getId(),
                "Mensaje restaurado",
                before,
                serializer.serializeMessageToJson(message)
        );

        return messageMapper.toDetailResponse(message);
    }

    // ─── Admin: unread count ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount() {
        requireAdminAccess();
        long count = messageRepository.countByStatusAndDeletedAtIsNull(MessageStatus.UNREAD);
        return new UnreadCountResponse(count);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Message findActive(UUID id) {
        return messageRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensaje no encontrado"));
    }

    private void requireAdminAccess() {
        if (SecurityUtils.getCurrentUser().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida");
        }
    }

    private void requireManageAccess() {
        User user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida"));
        if (!hasRole(Role.ADMIN, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requiere rol ADMIN o superior");
        }
    }

    private void requireOwnerAccess() {
        User user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Autenticación requerida"));
        if (!hasRole(Role.OWNER, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Se requiere rol OWNER o superior");
        }
    }

    private boolean hasRole(Role minRole) {
        return SecurityUtils.getCurrentUser()
                .map(u -> u.getRole().getLevel() >= minRole.getLevel())
                .orElse(false);
    }

    private boolean hasRole(Role minRole, User user) {
        return user.getRole().getLevel() >= minRole.getLevel();
    }

    private UUID currentUserId() {
        return SecurityUtils.getCurrentUser().map(User::getId).orElse(null);
    }
}
