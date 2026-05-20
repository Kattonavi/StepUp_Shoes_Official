-- ============================================================
-- V10__create_restore_actions.sql
-- Historial de restauraciones realizadas por SUPER_ADMIN.
-- Cada restauración genera su propio AuditLog y EntitySnapshot.
-- ============================================================

CREATE TABLE IF NOT EXISTS restore_actions (
    id                   UUID        NOT NULL DEFAULT gen_random_uuid(),
    snapshot_id          UUID        NOT NULL,
    restored_by_user_id  UUID        NOT NULL,
    restored_by_email    VARCHAR(255),
    entity_type          VARCHAR(50) NOT NULL,
    entity_id            UUID        NOT NULL,
    reason               TEXT,
    before_restore_data  JSONB,
    after_restore_data   JSONB,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT restore_actions_pkey        PRIMARY KEY (id),
    CONSTRAINT restore_actions_snapshot_fk FOREIGN KEY (snapshot_id) REFERENCES entity_snapshots (id)
);

CREATE INDEX idx_restore_actions_restored_by ON restore_actions (restored_by_user_id);
CREATE INDEX idx_restore_actions_entity_type ON restore_actions (entity_type);
CREATE INDEX idx_restore_actions_entity_id   ON restore_actions (entity_id);
CREATE INDEX idx_restore_actions_created_at  ON restore_actions (created_at DESC);
