-- ============================================================
-- V13__create_analytics_events.sql
-- Eventos de analítica públicos y de usuario anónimo.
-- Sin FK a products/categories: los eventos persisten aunque
-- las entidades sean eliminadas. productSlug/categorySlug
-- se desnormalizan al registrar el evento.
-- IP nunca se guarda en texto plano — solo hash SHA-256.
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id              UUID         NOT NULL DEFAULT gen_random_uuid(),
    event_type      VARCHAR(50)  NOT NULL,
    product_id      UUID,
    product_slug    VARCHAR(255),
    product_name    VARCHAR(255),
    category_id     UUID,
    category_slug   VARCHAR(255),
    category_name   VARCHAR(255),
    search_query    VARCHAR(500),
    source          VARCHAR(100),
    path            VARCHAR(1000),
    referrer        VARCHAR(1000),
    user_agent      VARCHAR(500),
    ip_hash         VARCHAR(64),
    session_id      VARCHAR(128),
    metadata        JSONB,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT analytics_events_pkey            PRIMARY KEY (id),
    CONSTRAINT analytics_events_type_valid      CHECK (event_type IN (
        'PRODUCT_VIEW', 'CATEGORY_VIEW', 'CATALOG_VIEW', 'SEARCH',
        'FILTER_APPLIED', 'WHATSAPP_CLICK', 'CONTACT_FORM_SUBMIT',
        'HOME_VIEW', 'CTA_CLICK'
    ))
);

CREATE INDEX idx_ae_event_type   ON analytics_events (event_type);
CREATE INDEX idx_ae_product_id   ON analytics_events (product_id);
CREATE INDEX idx_ae_product_slug ON analytics_events (product_slug);
CREATE INDEX idx_ae_category_id  ON analytics_events (category_id);
CREATE INDEX idx_ae_category_slug ON analytics_events (category_slug);
CREATE INDEX idx_ae_session_id   ON analytics_events (session_id);
CREATE INDEX idx_ae_created_at   ON analytics_events (created_at DESC);
