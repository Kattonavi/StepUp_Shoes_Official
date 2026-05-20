-- ============================================================
-- V8__create_audit_logs.sql
-- Registro inmutable de todas las acciones administrativas.
-- PROHIBIDO: DELETE y UPDATE desde la aplicación.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID         NOT NULL DEFAULT gen_random_uuid(),
    actor_user_id   UUID,
    actor_email     VARCHAR(255),
    actor_role      VARCHAR(50),
    action          VARCHAR(50)  NOT NULL,
    entity_type     VARCHAR(50)  NOT NULL,
    entity_id       UUID,
    description     TEXT,
    ip_address_hash VARCHAR(64),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
    CONSTRAINT audit_logs_action_valid CHECK (action IN (
        'CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE',
        'STATUS_CHANGE', 'ROLE_CHANGE', 'VISIBILITY_CHANGE', 'STOCK_CHANGE',
        'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'REFRESH_TOKEN',
        'SYSTEM_SEED', 'SYSTEM_EVENT'
    )),
    CONSTRAINT audit_logs_entity_type_valid CHECK (entity_type IN (
        'USER', 'PRODUCT', 'CATEGORY', 'PRODUCT_IMAGE', 'PRODUCT_SIZE',
        'STORE_SETTINGS', 'MESSAGE', 'SYSTEM'
    ))
);

CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs (actor_user_id);
CREATE INDEX idx_audit_logs_action        ON audit_logs (action);
CREATE INDEX idx_audit_logs_entity_type   ON audit_logs (entity_type);
CREATE INDEX idx_audit_logs_entity_id     ON audit_logs (entity_id);
CREATE INDEX idx_audit_logs_created_at    ON audit_logs (created_at DESC);
