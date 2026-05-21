-- ============================================================
-- V14__add_product_reference_code.sql
-- Agrega código de referencia único de 8 dígitos a productos.
-- ============================================================

ALTER TABLE products
    ADD COLUMN reference_code VARCHAR(8);

-- Backfill: asignar códigos únicos de 8 dígitos a productos existentes
WITH numbered AS (
    SELECT id,
           LPAD(ROW_NUMBER() OVER (ORDER BY created_at, id)::text, 8, '0') AS code
    FROM products
)
UPDATE products p
SET reference_code = n.code
FROM numbered n
WHERE p.id = n.id;

-- Ahora hacer la columna NOT NULL
ALTER TABLE products
    ALTER COLUMN reference_code SET NOT NULL;

-- Agregar restricción UNIQUE
ALTER TABLE products
    ADD CONSTRAINT products_reference_code_unique UNIQUE (reference_code);

-- Validar formato: exactamente 8 dígitos numéricos
ALTER TABLE products
    ADD CONSTRAINT products_reference_code_format
        CHECK (reference_code ~ '^\d{8}$');

CREATE INDEX idx_products_reference_code ON products (reference_code);
