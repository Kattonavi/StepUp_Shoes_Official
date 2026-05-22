-- ============================================================
-- V16__remove_product_reference_code.sql
-- Elimina la columna reference_code de products.
-- Los nombres de constraints e índices coinciden con lo creado en V14.
-- Uso de IF EXISTS para que sea seguro si la columna ya no existe.
-- ============================================================

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_reference_code_unique;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_reference_code_format;
DROP INDEX IF EXISTS idx_products_reference_code;
ALTER TABLE products DROP COLUMN IF EXISTS reference_code;
