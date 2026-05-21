package com.stepup.seed;

import com.stepup.users.Role;
import com.stepup.users.User;
import com.stepup.users.UserRepository;
import com.stepup.users.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class SuperAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.super-admin.email:}")
    private String superAdminEmail;

    @Value("${app.super-admin.password:}")
    private String superAdminPassword;

    @Value("${app.super-admin.full-name:Super Admin}")
    private String superAdminFullName;

    @Value("${app.super-admin.reset-password:false}")
    private boolean resetPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (resetPassword) {
            resetSuperAdminPassword();
        } else {
            seedSuperAdminIfAbsent();
        }
    }

    private void resetSuperAdminPassword() {
        if (superAdminEmail == null || superAdminEmail.isBlank()) {
            log.warn("SUPER_ADMIN_RESET_PASSWORD=true but SUPER_ADMIN_EMAIL is not set. Skipping reset.");
            return;
        }
        if (superAdminPassword == null || superAdminPassword.isBlank()) {
            log.warn("SUPER_ADMIN_RESET_PASSWORD=true but SUPER_ADMIN_PASSWORD is not set. Skipping reset.");
            return;
        }

        User user = userRepository.findByEmailAndDeletedAtIsNull(superAdminEmail).orElse(null);
        if (user == null) {
            log.warn("SUPER_ADMIN_RESET_PASSWORD=true but no active user found with email: {}. Skipping reset.",
                    superAdminEmail);
            return;
        }
        if (user.getRole() != Role.SUPER_ADMIN) {
            log.warn("SUPER_ADMIN_RESET_PASSWORD=true but user {} does not have SUPER_ADMIN role. Skipping reset.",
                    superAdminEmail);
            return;
        }

        user.setPasswordHash(passwordEncoder.encode(superAdminPassword));

        if (user.getStatus() == UserStatus.INACTIVE || user.getStatus() == UserStatus.BLOCKED) {
            user.setStatus(UserStatus.ACTIVE);
            user.setBlockedAt(null);
        }

        userRepository.save(user);
        log.info("SUPER_ADMIN password reset completed for email: {}", superAdminEmail);
    }

    private void seedSuperAdminIfAbsent() {
        boolean alreadyExists = userRepository.existsByRoleIncludingDeleted(Role.SUPER_ADMIN);
        if (alreadyExists) {
            log.info("SUPER_ADMIN already exists. Skipping seed.");
            return;
        }

        if (superAdminEmail == null || superAdminEmail.isBlank()) {
            log.warn("""
                    =====================================================
                    WARNING: SUPER_ADMIN_EMAIL is not set.
                    Set the SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD
                    environment variables to create the initial SUPER_ADMIN.
                    The system will not create any SUPER_ADMIN until both
                    variables are provided.
                    =====================================================
                    """);
            return;
        }

        if (superAdminPassword == null || superAdminPassword.isBlank()) {
            log.warn("SUPER_ADMIN_PASSWORD is not set. Skipping SUPER_ADMIN creation.");
            return;
        }

        User superAdmin = User.builder()
                .email(superAdminEmail)
                .passwordHash(passwordEncoder.encode(superAdminPassword))
                .fullName(superAdminFullName)
                .role(Role.SUPER_ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(superAdmin);

        log.info("""
                =====================================================
                SUPER_ADMIN created successfully.
                Email: {}
                IMPORTANT: Change the password immediately after first login.
                =====================================================
                """, superAdminEmail);
    }
}
