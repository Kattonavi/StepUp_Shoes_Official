-- ============================================================
-- V7__create_product_sizes.sql
-- Tallas e inventario básico por producto.
-- ============================================================

CREATE TABLE IF NOT EXISTS product_sizes (
    id             UUID        NOT NULL DEFAULT gen_random_uuid(),
    product_id     UUID        NOT NULL,
    size           VARCHAR(50) NOT NULL,
    stock_quantity INTEGER     NOT NULL DEFAULT 0,
    available      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT product_sizes_pkey              PRIMARY KEY (id),
    CONSTRAINT product_sizes_product_fk        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT product_sizes_stock_non_negative CHECK (stock_quantity >= 0),
    CONSTRAINT product_sizes_unique_per_product UNIQUE (product_id, size)
);

CREATE INDEX idx_product_sizes_product_id ON product_sizes (product_id);
