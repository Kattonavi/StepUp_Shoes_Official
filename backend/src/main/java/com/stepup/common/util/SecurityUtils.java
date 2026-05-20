package com.stepup.common.util;

import com.stepup.security.StepUpUserDetails;
import com.stepup.users.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public final class SecurityUtils {

    private SecurityUtils() {}

    /** Retorna el usuario autenticado del contexto de seguridad, si existe. */
    public static Optional<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return Optional.empty();
        }
        if (auth.getPrincipal() instanceof StepUpUserDetails details) {
            return Optional.of(details.getUser());
        }
        return Optional.empty();
    }

    /** Retorna el usuario autenticado o lanza IllegalStateException si no existe. */
    public static User requireCurrentUser() {
        return getCurrentUser()
                .orElseThrow(() -> new IllegalStateException("No authenticated user in context"));
    }

    /** Retorna true si hay un usuario autenticado en el contexto. */
    public static boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof StepUpUserDetails;
    }
}
