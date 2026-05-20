-- ============================================================
-- V3__create_refresh_tokens.sql
-- Tabla de refresh tokens para rotación segura de sesiones.
-- Se almacena el hash SHA-256 del token, nunca el token plano.
-- ============================================================

CREATE TABLE refresh_tokens (
    id              UUID                        NOT NULL DEFAULT gen_random_uuid(),
    user_id         UUID                        NOT NULL,
    token_hash      VARCHAR(64)                 NOT NULL,
    expires_at      TIMESTAMP WITH TIME ZONE    NOT NULL,
    revoked_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    created_by_ip   VARCHAR(45),
    revoked_by_ip   VARCHAR(45),
    user_agent      VARCHAR(512),

    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para búsquedas de refresh y limpieza de tokens expirados
CREATE INDEX idx_refresh_tokens_token_hash  ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user_id     ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at  ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_active      ON refresh_tokens(user_id)
    WHERE revoked_at IS NULL AND expires_at > NOW();
