package com.stepup.messages.repository;

import com.stepup.messages.entity.Message;
import com.stepup.messages.enums.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID>, JpaSpecificationExecutor<Message> {

    Optional<Message> findByIdAndDeletedAtIsNull(UUID id);

    long countByStatusAndDeletedAtIsNull(MessageStatus status);
}
