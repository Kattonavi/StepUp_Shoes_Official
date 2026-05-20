-- ============================================================
-- V9__create_entity_snapshots.sql
-- Estado antes/después de cada acción auditable.
-- JSONB para permitir queries estructuradas en el futuro.
-- PROHIBIDO: DELETE y UPDATE desde la aplicación.
-- ============================================================

CREATE TABLE IF NOT EXISTS entity_snapshots (
    id              UUID        NOT NULL DEFAULT gen_random_uuid(),
    audit_log_id    UUID        NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID        NOT NULL,
    before_data     JSONB,
    after_data      JSONB,
    snapshot_reason VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT entity_snapshots_pkey          PRIMARY KEY (id),
    CONSTRAINT entity_snapshots_audit_log_fk  FOREIGN KEY (audit_log_id) REFERENCES audit_logs (id),
    CONSTRAINT entity_snapshots_reason_valid  CHECK (snapshot_reason IN (
        'BEFORE_UPDATE', 'AFTER_UPDATE', 'BEFORE_DELETE', 'AFTER_RESTORE', 'MANUAL', 'SYSTEM'
    ))
);

CREATE INDEX idx_entity_snapshots_audit_log_id ON entity_snapshots (audit_log_id);
CREATE INDEX idx_entity_snapshots_entity_type  ON entity_snapshots (entity_type);
CREATE INDEX idx_entity_snapshots_entity_id    ON entity_snapshots (entity_id);
CREATE INDEX idx_entity_snapshots_created_at   ON entity_snapshots (created_at DESC);
