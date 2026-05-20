-- ============================================================
-- V4__create_categories.sql
-- Tabla de categorías de productos con soft delete.
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL,
    icon        VARCHAR(100),
    description TEXT,
    position    INTEGER      NOT NULL DEFAULT 0,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    deleted_by  UUID,

    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_categories_slug       ON categories (slug);
CREATE INDEX idx_categories_active     ON categories (active);
CREATE INDEX idx_categories_deleted_at ON categories (deleted_at);
CREATE INDEX idx_categories_position   ON categories (position);
