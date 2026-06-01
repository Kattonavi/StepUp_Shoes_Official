-- ============================================================
-- V22__create_storefront_events.sql
-- Eventos del storefront para analítica operacional de tienda.
--
-- Privacidad: NO se guarda IP exacta, email, teléfono ni nombre del visitante.
-- Solo hashes anónimos opcionales (session_hash, user_agent_hash) para
-- deduplicar/filtrar bots, nunca datos personales.
--
-- Sin FK a products/categories/promotions: los eventos persisten aunque las
-- entidades se eliminen; los slugs/nombres se desnormalizan al registrar.
--
-- Tabla separada de `analytics_events` a propósito: el endpoint público nuevo
-- es /storefront-events (nombre resistente a adblock), distinto de
-- /analytics/events (bloqueable por extensiones).
-- ============================================================

CREATE TABLE IF NOT EXISTS storefront_events (
    id               UUID         NOT NULL DEFAULT gen_random_uuid(),
    event_type       VARCHAR(50)  NOT NULL,
    product_id       UUID,
    product_slug     VARCHAR(255),
    product_name     VARCHAR(255),
    category_id      UUID,
    category_slug    VARCHAR(255),
    category_name    VARCHAR(255),
    promotion_id     UUID,
    promotion_title  VARCHAR(255),
    selected_size    VARCHAR(50),
    stock_status     VARCHAR(50),
    source_page      VARCHAR(255),
    metadata         JSONB,
    user_agent_hash  VARCHAR(128),
    session_hash     VARCHAR(128),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT storefront_events_pkey PRIMARY KEY (id),
    CONSTRAINT storefront_events_type_valid CHECK (event_type IN (
        'PRODUCT_VIEW',
        'WHATSAPP_CLICK',
        'PROMOTION_VIEW',
        'PROMOTION_CLICK',
        'CATEGORY_VIEW',
        'CATALOG_VIEW',
        'HOME_VIEW'
    ))
);

CREATE INDEX idx_sfe_event_type        ON storefront_events (event_type);
CREATE INDEX idx_sfe_product_id        ON storefront_events (product_id);
CREATE INDEX idx_sfe_category_id       ON storefront_events (category_id);
CREATE INDEX idx_sfe_promotion_id      ON storefront_events (promotion_id);
CREATE INDEX idx_sfe_created_at        ON storefront_events (created_at DESC);
CREATE INDEX idx_sfe_type_created_at   ON storefront_events (event_type, created_at DESC);
CREATE INDEX idx_sfe_product_type      ON storefront_events (product_id, event_type);
