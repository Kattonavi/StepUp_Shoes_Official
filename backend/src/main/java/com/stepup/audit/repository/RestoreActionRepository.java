package com.stepup.audit.repository;

import com.stepup.audit.entity.RestoreAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RestoreActionRepository extends JpaRepository<RestoreAction, UUID> {

    Page<RestoreAction> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
