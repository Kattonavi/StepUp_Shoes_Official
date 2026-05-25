-- ============================================================
-- V19__add_cloudinary_public_id_to_product_images.sql
-- Soporte para Cloudinary: guarda el public_id de cada imagen
-- subida desde el panel admin. Las imágenes pegadas como URL
-- manual mantienen este campo en NULL.
-- ============================================================

ALTER TABLE product_images
    ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255);
