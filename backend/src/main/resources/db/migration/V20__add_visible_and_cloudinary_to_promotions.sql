-- ============================================================
-- V20__add_visible_and_cloudinary_to_promotions.sql
-- Promociones como biblioteca de presets:
--  - `visible`              → controla si aparece en la home (sin borrar).
--  - `cloudinary_public_id` → opcional, para borrar el asset real cuando se
--                             quita la imagen desde el admin.
-- Las promociones existentes quedan visibles por defecto para no romper
-- la experiencia actual.
-- ============================================================

ALTER TABLE promotions
    ADD COLUMN IF NOT EXISTS visible BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE promotions
    ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255);

-- Replace the active+position index with a more selective one that also
-- filters by `visible` — el endpoint público solo consulta promos
-- active=true AND visible=true AND not-deleted.
DROP INDEX IF EXISTS idx_promotions_active_position;

CREATE INDEX idx_promotions_visible_active_position
    ON promotions (position)
    WHERE active = TRUE AND visible = TRUE AND deleted_at IS NULL;
