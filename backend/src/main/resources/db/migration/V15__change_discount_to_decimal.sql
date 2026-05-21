-- ============================================================
-- V15__change_discount_to_decimal.sql
-- Cambia discount_percentage de INTEGER a NUMERIC(5,2) para
-- permitir porcentajes con decimales (ej: 33.33%).
-- ============================================================

-- Eliminar constraint existente (se recrea después)
ALTER TABLE products
    DROP CONSTRAINT IF EXISTS products_discount_range;

-- Cambiar tipo de columna a NUMERIC(5,2)
ALTER TABLE products
    ALTER COLUMN discount_percentage TYPE NUMERIC(5,2)
        USING discount_percentage::NUMERIC(5,2);

-- Recrear constraint de rango
ALTER TABLE products
    ADD CONSTRAINT products_discount_range
        CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100));
