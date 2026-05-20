package com.stepup.users;

/**
 * Jerarquía de roles del sistema StepUp.
 * El nivel numérico define qué rol puede gestionar a cuál.
 * Un rol solo puede gestionar roles con nivel estrictamente menor al propio.
 */
public enum Role {

    SUPER_ADMIN(5),
    OWNER(4),
    ADMIN(3),
    EDITOR(2),
    VIEWER(1);

    private final int level;

    Role(int level) {
        this.level = level;
    }

    public int getLevel() {
        return level;
    }

    /** Verdadero si este rol puede gestionar (ver, editar, bloquear) al rol objetivo. */
    public boolean canManage(Role target) {
        return this.level > target.level;
    }

    /** Verdadero si este rol puede asignar el rol objetivo a otro usuario. */
    public boolean canAssign(Role target) {
        return this.level > target.level;
    }

    /** Verdadero si este rol tiene acceso al Control Center. */
    public boolean hasControlCenterAccess() {
        return this == SUPER_ADMIN;
    }
}
