package com.stepup.messages;

import com.stepup.common.response.ApiResponse;
import com.stepup.messages.dto.CreateMessageRequest;
import com.stepup.messages.dto.MessageDetailResponse;
import com.stepup.messages.dto.MessageResponse;
import com.stepup.messages.dto.UnreadCountResponse;
import com.stepup.messages.dto.UpdateMessageNotesRequest;
import com.stepup.messages.enums.MessageSource;
import com.stepup.messages.enums.MessageStatus;
import com.stepup.messages.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // ─── Public: create message ───────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<MessageDetailResponse>> createMessage(
            @Valid @RequestBody CreateMessageRequest request
    ) {
        MessageDetailResponse response = messageService.createMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Mensaje enviado correctamente"));
    }

    // ─── Admin: list messages ─────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> listMessages(
            @RequestParam(required = false) MessageStatus status,
            @RequestParam(required = false) MessageSource source,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<MessageResponse> messages = messageService.listMessages(
                status, source, search, productId, from, to, includeDeleted, page, size
        );
        return ResponseEntity.ok(ApiResponse.ok(messages));
    }

    // ─── Admin: get message detail ────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageDetailResponse>> getMessage(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.getMessage(id)));
    }

    // ─── Admin: unread count ──────────────────────────────────────────────────

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.ok(messageService.getUnreadCount()));
    }

    // ─── Admin: status changes ────────────────────────────────────────────────

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<MessageDetailResponse>> markRead(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.markRead(id)));
    }

    @PatchMapping("/{id}/unread")
    public ResponseEntity<ApiResponse<MessageDetailResponse>> markUnread(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.markUnread(id)));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<MessageDetailResponse>> archive(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.archiveMessage(id)));
    }

    // ─── Admin: internal notes ────────────────────────────────────────────────

    @PatchMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<MessageDetailResponse>> updateNotes(
            @PathVariable UUID id,
            @RequestBody UpdateMessageNotesRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.updateNotes(id, request)));
    }

    // ─── Admin: soft delete ───────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable UUID id) {
        messageService.deleteMessage(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Mensaje eliminado"));
    }

    // ─── Admin: restore ───────────────────────────────────────────────────────

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<MessageDetailResponse>> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(messageService.restoreMessage(id), "Mensaje restaurado"));
    }
}
