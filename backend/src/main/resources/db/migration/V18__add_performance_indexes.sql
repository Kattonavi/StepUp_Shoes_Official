-- ============================================================
-- V18__add_performance_indexes.sql
-- Composite/targeted indexes for queries identified by Phase B audit.
-- All indexes use IF NOT EXISTS — re-running the migration is safe.
-- Single-column equivalents already exist; these complement them
-- by avoiding bitmap-merge plans on common filter combinations.
-- ============================================================

-- ── audit_logs ──────────────────────────────────────────────
-- Entity history lookups: GET /control-center/audit-logs?entityType=X&entityId=Y
-- order by created_at desc. Composite avoids two index scans + merge.
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id_created
    ON audit_logs (entity_type, entity_id, created_at DESC);

-- Recent-by-actor queries (dashboard activity, "who did what last week").
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created
    ON audit_logs (actor_user_id, created_at DESC);

-- ── entity_snapshots ────────────────────────────────────────
-- Used by getRecentByEntity (top 5 by entity_type+entity_id order by created_at desc)
-- and the deleted-items lookup in Control Center.
CREATE INDEX IF NOT EXISTS idx_entity_snapshots_entity_type_id_created
    ON entity_snapshots (entity_type, entity_id, created_at DESC);

-- ── messages ────────────────────────────────────────────────
-- Unread count: WHERE status = 'UNREAD' AND deleted_at IS NULL.
-- Admin filter list: WHERE status = ? AND deleted_at IS NULL ORDER BY created_at DESC.
CREATE INDEX IF NOT EXISTS idx_messages_status_deleted_created
    ON messages (status, deleted_at, created_at DESC);

-- ── refresh_tokens ──────────────────────────────────────────
-- Cleanup: DELETE FROM refresh_tokens WHERE revoked_at IS NOT NULL AND revoked_at < ?.
-- Without this index the daily cleanup does a full table scan as the table grows.
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked_at
    ON refresh_tokens (revoked_at)
    WHERE revoked_at IS NOT NULL;

-- ── analytics_events ────────────────────────────────────────
-- Per-type filtering combined with time ranges (summary, list endpoint).
-- Composite avoids merging idx_ae_event_type with idx_ae_created_at.
CREATE INDEX IF NOT EXISTS idx_ae_event_type_created
    ON analytics_events (event_type, created_at DESC);
