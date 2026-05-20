package com.stepup.users;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Role Hierarchy Unit Tests")
class RoleHierarchyTest {

    @Test
    @DisplayName("SUPER_ADMIN has the highest level")
    void superAdmin_hasHighestLevel() {
        assertThat(Role.SUPER_ADMIN.getLevel()).isGreaterThan(Role.OWNER.getLevel());
        assertThat(Role.SUPER_ADMIN.getLevel()).isGreaterThan(Role.ADMIN.getLevel());
        assertThat(Role.SUPER_ADMIN.getLevel()).isGreaterThan(Role.EDITOR.getLevel());
        assertThat(Role.SUPER_ADMIN.getLevel()).isGreaterThan(Role.VIEWER.getLevel());
    }

    @Test
    @DisplayName("Level order is: SUPER_ADMIN > OWNER > ADMIN > EDITOR > VIEWER")
    void levelOrder_isCorrect() {
        assertThat(Role.SUPER_ADMIN.getLevel()).isEqualTo(5);
        assertThat(Role.OWNER.getLevel()).isEqualTo(4);
        assertThat(Role.ADMIN.getLevel()).isEqualTo(3);
        assertThat(Role.EDITOR.getLevel()).isEqualTo(2);
        assertThat(Role.VIEWER.getLevel()).isEqualTo(1);
    }

    @ParameterizedTest(name = "{0} canManage {1} = {2}")
    @CsvSource({
            "SUPER_ADMIN, OWNER,  true",
            "SUPER_ADMIN, ADMIN,  true",
            "SUPER_ADMIN, EDITOR, true",
            "SUPER_ADMIN, VIEWER, true",
            "OWNER,       ADMIN,  true",
            "OWNER,       EDITOR, true",
            "OWNER,       VIEWER, true",
            "ADMIN,       EDITOR, true",
            "ADMIN,       VIEWER, true",
            "EDITOR,      VIEWER, true",
            // Cannot manage same or higher
            "OWNER,       OWNER,         false",
            "OWNER,       SUPER_ADMIN,   false",
            "ADMIN,       ADMIN,         false",
            "ADMIN,       OWNER,         false",
            "ADMIN,       SUPER_ADMIN,   false",
            "EDITOR,      EDITOR,        false",
            "EDITOR,      ADMIN,         false",
            "VIEWER,      VIEWER,        false",
            "VIEWER,      EDITOR,        false",
    })
    @DisplayName("canManage returns correct value for all role combinations")
    void canManage_returnsCorrectValue(Role caller, Role target, boolean expected) {
        assertThat(caller.canManage(target)).isEqualTo(expected);
    }

    @ParameterizedTest(name = "{0} canAssign {1} = {2}")
    @CsvSource({
            "SUPER_ADMIN, OWNER,         true",
            "SUPER_ADMIN, ADMIN,         true",
            "SUPER_ADMIN, EDITOR,        true",
            "SUPER_ADMIN, VIEWER,        true",
            "OWNER,       ADMIN,         true",
            "OWNER,       EDITOR,        true",
            "OWNER,       VIEWER,        true",
            // Cannot assign same or higher
            "OWNER,       OWNER,         false",
            "OWNER,       SUPER_ADMIN,   false",
            "ADMIN,       ADMIN,         false",
            "ADMIN,       OWNER,         false",
            "VIEWER,      VIEWER,        false",
    })
    @DisplayName("canAssign returns correct value for all role combinations")
    void canAssign_returnsCorrectValue(Role caller, Role target, boolean expected) {
        assertThat(caller.canAssign(target)).isEqualTo(expected);
    }

    @Test
    @DisplayName("Only SUPER_ADMIN has Control Center access")
    void controlCenterAccess_onlySuperAdmin() {
        assertThat(Role.SUPER_ADMIN.hasControlCenterAccess()).isTrue();
        assertThat(Role.OWNER.hasControlCenterAccess()).isFalse();
        assertThat(Role.ADMIN.hasControlCenterAccess()).isFalse();
        assertThat(Role.EDITOR.hasControlCenterAccess()).isFalse();
        assertThat(Role.VIEWER.hasControlCenterAccess()).isFalse();
    }

    @Test
    @DisplayName("isAllowedToAuthenticate: only ACTIVE status allows login")
    void userStatus_allowedToAuthenticate() {
        assertThat(UserStatus.ACTIVE.isAllowedToAuthenticate()).isTrue();
        assertThat(UserStatus.INACTIVE.isAllowedToAuthenticate()).isFalse();
        assertThat(UserStatus.BLOCKED.isAllowedToAuthenticate()).isFalse();
        assertThat(UserStatus.DELETED.isAllowedToAuthenticate()).isFalse();
    }
}
