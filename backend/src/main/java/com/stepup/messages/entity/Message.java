package com.stepup.messages.entity;

import com.stepup.messages.enums.MessageSource;
import com.stepup.messages.enums.MessageStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "subject", length = 500)
    private String subject;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "product_id", columnDefinition = "uuid")
    private UUID productId;

    @Column(name = "product_name", length = 255)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 30)
    @Builder.Default
    private MessageSource source = MessageSource.CONTACT_FORM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private MessageStatus status = MessageStatus.UNREAD;

    @Column(name = "internal_notes", columnDefinition = "text")
    private String internalNotes;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "read_by", columnDefinition = "uuid")
    private UUID readBy;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(name = "archived_by", columnDefinition = "uuid")
    private UUID archivedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by", columnDefinition = "uuid")
    private UUID deletedBy;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean isDeleted() {
        return deletedAt != null || status == MessageStatus.DELETED;
    }
}
