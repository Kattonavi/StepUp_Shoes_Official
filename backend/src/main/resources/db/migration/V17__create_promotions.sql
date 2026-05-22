-- V17: Create promotions table
CREATE TABLE promotions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        VARCHAR(255) NOT NULL,
    subtitle     VARCHAR(500),
    image_url    VARCHAR(1000),
    link_url     VARCHAR(1000),
    link_label   VARCHAR(100),
    badge_text   VARCHAR(50),
    active       BOOLEAN NOT NULL DEFAULT true,
    position     INTEGER NOT NULL DEFAULT 0,
    starts_at    TIMESTAMPTZ,
    ends_at      TIMESTAMPTZ,
    created_by   UUID,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ,
    deleted_by   UUID
);

CREATE INDEX idx_promotions_active_position ON promotions (position)
    WHERE active = true AND deleted_at IS NULL;
