-- ============================================================
-- V5__create_products.sql
-- Tabla de productos con soft delete, estados y flags de catálogo.
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id                  UUID           NOT NULL DEFAULT gen_random_uuid(),
    name                VARCHAR(255)   NOT NULL,
    slug                VARCHAR(255)   NOT NULL,
    description         TEXT,
    category_id         UUID           NOT NULL,
    price               DECIMAL(10, 2) NOT NULL,
    old_price           DECIMAL(10, 2),
    discount_percentage INTEGER,
    status              VARCHAR(20)    NOT NULL DEFAULT 'DRAFT',
    stock_status        VARCHAR(20)    NOT NULL DEFAULT 'AVAILABLE',
    is_new              BOOLEAN        NOT NULL DEFAULT FALSE,
    is_on_sale          BOOLEAN        NOT NULL DEFAULT FALSE,
    is_featured         BOOLEAN        NOT NULL DEFAULT FALSE,
    visible             BOOLEAN        NOT NULL DEFAULT TRUE,
    seo_title           VARCHAR(255),
    seo_description     VARCHAR(500),
    display_order       INTEGER        NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    deleted_by          UUID,

    CONSTRAINT products_pkey                  PRIMARY KEY (id),
    CONSTRAINT products_slug_unique           UNIQUE (slug),
    CONSTRAINT products_category_fk           FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT products_price_non_negative    CHECK (price >= 0),
    CONSTRAINT products_old_price_non_negative CHECK (old_price IS NULL OR old_price >= 0),
    CONSTRAINT products_discount_range        CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)),
    CONSTRAINT products_status_valid          CHECK (status IN ('ACTIVE', 'DRAFT', 'HIDDEN', 'DELETED')),
    CONSTRAINT products_stock_status_valid    CHECK (stock_status IN ('AVAILABLE', 'OUT_OF_STOCK', 'ON_REQUEST'))
);

CREATE INDEX idx_products_slug         ON products (slug);
CREATE INDEX idx_products_category_id  ON products (category_id);
CREATE INDEX idx_products_status       ON products (status);
CREATE INDEX idx_products_stock_status ON products (stock_status);
CREATE INDEX idx_products_visible      ON products (visible);
CREATE INDEX idx_products_deleted_at   ON products (deleted_at);
CREATE INDEX idx_products_is_featured  ON products (is_featured);
CREATE INDEX idx_products_is_new       ON products (is_new);
CREATE INDEX idx_products_is_on_sale   ON products (is_on_sale);
