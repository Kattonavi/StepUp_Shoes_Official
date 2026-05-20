-- ============================================================
-- V2__create_users.sql
-- Tabla de usuarios del sistema StepUp.
-- ============================================================

CREATE TABLE users (
    id              UUID                        NOT NULL DEFAULT gen_random_uuid(),
    email           VARCHAR(255)                NOT NULL,
    password_hash   VARCHAR(255)                NOT NULL,
    full_name       VARCHAR(255)                NOT NULL,
    role            VARCHAR(20)                 NOT NULL,
    status          VARCHAR(20)                 NOT NULL DEFAULT 'ACTIVE',
    last_login_at   TIMESTAMP WITH TIME ZONE,
    blocked_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMP WITH TIME ZONE,
    deleted_by      UUID,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('SUPER_ADMIN', 'OWNER', 'ADMIN', 'EDITOR', 'VIEWER')),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED'))
);

-- Índices de búsqueda frecuente
CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_role        ON users(role);
CREATE INDEX idx_users_status      ON users(status);
CREATE INDEX idx_users_deleted_at  ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role_active ON users(role) WHERE deleted_at IS NULL AND status = 'ACTIVE';
