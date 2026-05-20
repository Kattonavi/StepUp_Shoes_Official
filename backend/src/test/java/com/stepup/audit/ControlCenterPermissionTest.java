package com.stepup.audit;

import com.stepup.users.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Control Center Permission Rules")
class ControlCenterPermissionTest {

    @Test
    @DisplayName("Only SUPER_ADMIN has Control Center access via Role enum")
    void onlySuperAdmin_hasControlCenterAccess() {
        assertThat(Role.SUPER_ADMIN.hasControlCenterAccess()).isTrue();
    }

    @ParameterizedTest(name = "{0} does NOT have Control Center access")
    @EnumSource(value = Role.class, names = {"OWNER", "ADMIN", "EDITOR", "VIEWER"})
    @DisplayName("Non-SUPER_ADMIN roles have no Control Center access")
    void nonSuperAdmin_hasNoControlCenterAccess(Role role) {
        assertThat(role.hasControlCenterAccess()).isFalse();
    }

    @Test
    @DisplayName("SUPER_ADMIN cannot be assigned via canAssign rule")
    void superAdmin_cannotBeAssignedViaApi() {
        // Verify that no role (including SUPER_ADMIN itself) can assign SUPER_ADMIN
        for (Role caller : Role.values()) {
            assertThat(caller.canAssign(Role.SUPER_ADMIN))
                    .as("Role %s should not be able to assign SUPER_ADMIN", caller)
                    .isFalse();
        }
    }

    @Test
    @DisplayName("OWNER cannot manage SUPER_ADMIN")
    void owner_cannotManageSuperAdmin() {
        assertThat(Role.OWNER.canManage(Role.SUPER_ADMIN)).isFalse();
    }

    @Test
    @DisplayName("ADMIN cannot manage OWNER or SUPER_ADMIN")
    void admin_cannotManageOwnerOrSuperAdmin() {
        assertThat(Role.ADMIN.canManage(Role.OWNER)).isFalse();
        assertThat(Role.ADMIN.canManage(Role.SUPER_ADMIN)).isFalse();
    }

    @Test
    @DisplayName("AuditLog is conceptually immutable — no deleteAuditLog endpoint exists")
    void auditLog_isImmutableConcept() {
        // AuditLogRepository is an interface (not an entity with delete API exposed to users)
        assertThat(com.stepup.audit.repository.AuditLogRepository.class).isInterface();

        // No controller method should be named to delete audit logs or snapshots
        assertThat(ControlCenterController.class.getDeclaredMethods())
                .filteredOn(m -> m.getName().startsWith("deleteAuditLog")
                        || m.getName().startsWith("deleteSnapshot")
                        || m.getName().startsWith("removeLog"))
                .isEmpty();
    }
}
