package com.stepup.users;

public enum UserStatus {
    ACTIVE,
    INACTIVE,
    BLOCKED,
    DELETED;

    public boolean isAllowedToAuthenticate() {
        return this == ACTIVE;
    }
}
