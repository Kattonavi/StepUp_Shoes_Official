package com.stepup.users.service;

import com.stepup.audit.enums.AuditAction;
import com.stepup.audit.enums.AuditableEntityType;
import com.stepup.audit.service.AuditLogService;
import com.stepup.audit.service.EntitySerializationService;
import com.stepup.auth.RefreshTokenRepository;
import com.stepup.common.exception.EmailAlreadyExistsException;
import com.stepup.common.exception.ForbiddenOperationException;
import com.stepup.users.Role;
import com.stepup.users.User;
import com.stepup.users.UserRepository;
import com.stepup.users.UserStatus;
import com.stepup.users.dto.CreateUserRequest;
import com.stepup.users.dto.UpdateUserRequest;
import com.stepup.users.dto.UpdateUserRoleRequest;
import com.stepup.users.dto.UpdateUserStatusRequest;
import com.stepup.users.dto.UserResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final EntitySerializationService serializer;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public Page<UserResponse> listUsers(User caller, Pageable pageable) {
        if (caller.getRole() == Role.SUPER_ADMIN) {
            return userRepository.findAllByDeletedAtIsNull(pageable).map(UserResponse::from);
        }
        return userRepository.findAllByDeletedAtIsNullAndRoleNot(Role.SUPER_ADMIN, pageable)
                .map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse getById(UUID id, User caller) {
        User target = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        assertCanSee(caller, target);
        return UserResponse.from(target);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, User caller) {
        assertCanAssignRole(caller, request.role());

        if (userRepository.existsByEmailAndDeletedAtIsNull(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        User newUser = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(request.role())
                .status(UserStatus.ACTIVE)
                .build();

        User saved = userRepository.save(newUser);
        auditLogService.log(AuditAction.CREATE, AuditableEntityType.USER, saved.getId(),
                "User '" + saved.getEmail() + "' created with role " + saved.getRole(),
                null, serializer.serializeUserToJson(saved));
        log.info("User created: {} with role {} by {}", saved.getEmail(), saved.getRole(), caller.getEmail());
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request, User caller) {
        User target = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        assertCanManage(caller, target);

        String beforeJson = serializer.serializeUserToJson(target);
        target.setFullName(request.fullName());
        User saved = userRepository.save(target);
        auditLogService.log(AuditAction.UPDATE, AuditableEntityType.USER, id,
                "User '" + saved.getEmail() + "' name updated",
                beforeJson, serializer.serializeUserToJson(saved));
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse updateStatus(UUID id, UpdateUserStatusRequest request, User caller) {
        User target = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        assertCanManage(caller, target);

        String beforeJson = serializer.serializeUserToJson(target);
        UserStatus newStatus = request.status();
        if (newStatus == UserStatus.BLOCKED) target.setBlockedAt(Instant.now());
        else if (newStatus == UserStatus.ACTIVE) target.setBlockedAt(null);
        target.setStatus(newStatus);

        User saved = userRepository.save(target);

        // Revoke active refresh tokens if the user can no longer authenticate.
        // Access tokens already in use will still work until they expire (max 15 min),
        // but refresh will be blocked so the session cannot be extended.
        if (!newStatus.isAllowedToAuthenticate()) {
            int revoked = refreshTokenRepository.revokeAllActiveByUserId(id, Instant.now());
            if (revoked > 0) {
                log.info("Revoked {} active refresh tokens for user {} after status change to {}",
                        revoked, target.getEmail(), newStatus);
            }
        }

        auditLogService.log(AuditAction.STATUS_CHANGE, AuditableEntityType.USER, id,
                "User '" + target.getEmail() + "' status changed to " + newStatus + " by " + caller.getEmail(),
                beforeJson, serializer.serializeUserToJson(saved));
        log.info("User {} status changed to {} by {}", target.getEmail(), newStatus, caller.getEmail());
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse updateRole(UUID id, UpdateUserRoleRequest request, User caller) {
        User target = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        assertCanManage(caller, target);
        assertCanAssignRole(caller, request.role());

        String beforeJson = serializer.serializeUserToJson(target);
        Role previousRole = target.getRole();
        target.setRole(request.role());
        User saved = userRepository.save(target);

        // Revoke active refresh tokens so the new role applies on next login.
        // Existing access tokens carry the old role claim until they expire (max 15 min).
        if (previousRole != request.role()) {
            int revoked = refreshTokenRepository.revokeAllActiveByUserId(id, Instant.now());
            if (revoked > 0) {
                log.info("Revoked {} active refresh tokens for user {} after role change to {}",
                        revoked, target.getEmail(), request.role());
            }
        }

        auditLogService.log(AuditAction.ROLE_CHANGE, AuditableEntityType.USER, id,
                "User '" + target.getEmail() + "' role changed to " + request.role() + " by " + caller.getEmail(),
                beforeJson, serializer.serializeUserToJson(saved));
        log.info("User {} role changed to {} by {}", target.getEmail(), request.role(), caller.getEmail());
        return UserResponse.from(saved);
    }

    @Transactional
    public void deleteUser(UUID id, User caller) {
        User target = userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
        if (target.getId().equals(caller.getId())) {
            throw new ForbiddenOperationException("Cannot delete your own account");
        }
        assertCanManage(caller, target);

        String beforeJson = serializer.serializeUserToJson(target);
        target.setStatus(UserStatus.DELETED);
        target.setDeletedAt(Instant.now());
        target.setDeletedBy(caller.getId());
        userRepository.save(target);

        // Revoke active refresh tokens — deleted users cannot extend sessions.
        int revoked = refreshTokenRepository.revokeAllActiveByUserId(id, Instant.now());
        if (revoked > 0) {
            log.info("Revoked {} active refresh tokens for user {} after soft-delete",
                    revoked, target.getEmail());
        }

        auditLogService.log(AuditAction.SOFT_DELETE, AuditableEntityType.USER, id,
                "User '" + target.getEmail() + "' soft-deleted by " + caller.getEmail(),
                beforeJson, null);
        log.info("User soft-deleted: {} by {}", target.getEmail(), caller.getEmail());
    }

    // ─── Role hierarchy guards ────────────────────────────────────────────────

    private void assertCanSee(User caller, User target) {
        if (target.getRole() == Role.SUPER_ADMIN && caller.getRole() != Role.SUPER_ADMIN) {
            throw new ForbiddenOperationException("Cannot access SUPER_ADMIN users");
        }
    }

    private void assertCanManage(User caller, User target) {
        if (target.getRole() == Role.SUPER_ADMIN) {
            throw new ForbiddenOperationException("Cannot modify SUPER_ADMIN users");
        }
        if (!caller.getRole().canManage(target.getRole())) {
            throw new ForbiddenOperationException(
                    "Your role cannot manage users with role: " + target.getRole());
        }
    }

    private void assertCanAssignRole(User caller, Role targetRole) {
        if (targetRole == Role.SUPER_ADMIN) {
            throw new ForbiddenOperationException("Cannot assign SUPER_ADMIN role via API");
        }
        if (!caller.getRole().canAssign(targetRole)) {
            throw new ForbiddenOperationException("Your role cannot assign role: " + targetRole);
        }
    }
}
