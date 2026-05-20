-- ============================================================
-- V6__create_product_images.sql
-- Imágenes de producto. Solo URLs, sin upload real en esta fase.
-- ============================================================

CREATE TABLE IF NOT EXISTS product_images (
    id         UUID          NOT NULL DEFAULT gen_random_uuid(),
    product_id UUID          NOT NULL,
    url        VARCHAR(1000) NOT NULL,
    alt_text   VARCHAR(255),
    position   INTEGER       NOT NULL DEFAULT 0,
    main_image BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT product_images_pkey       PRIMARY KEY (id),
    CONSTRAINT product_images_product_fk FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product_id ON product_images (product_id);
