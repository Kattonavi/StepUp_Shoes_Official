package com.stepup.messages.repository;

import com.stepup.messages.entity.Message;
import com.stepup.messages.enums.MessageSource;
import com.stepup.messages.enums.MessageStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class MessageSpecification {

    private MessageSpecification() {}

    public static Specification<Message> buildFilter(
            MessageStatus status,
            MessageSource source,
            String search,
            UUID productId,
            Instant from,
            Instant to,
            boolean includeDeleted
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!includeDeleted) {
                predicates.add(cb.isNull(root.get("deletedAt")));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (source != null) {
                predicates.add(cb.equal(root.get("source"), source));
            }

            if (productId != null) {
                predicates.add(cb.equal(root.get("productId"), productId));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("subject")), pattern),
                        cb.like(cb.lower(root.get("productName")), pattern)
                ));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
