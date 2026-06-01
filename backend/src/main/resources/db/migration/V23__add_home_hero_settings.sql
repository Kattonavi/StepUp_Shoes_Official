-- ============================================================
-- V23__add_home_hero_settings.sql
-- Campos editables del hero principal de la home, en store_settings.
--
-- Reutiliza los campos ya existentes: hero_title, hero_subtitle,
-- hero_cta_text (CTA principal), hero_cta_url, whatsapp_number,
-- whatsapp_default_message. Aquí solo se añaden los que faltaban.
--
-- Todos nullable con default razonable; los existentes se backfillean con el
-- default. No se modifican migraciones previas.
-- ============================================================

ALTER TABLE store_settings
    ADD COLUMN IF NOT EXISTS hero_eyebrow_text       VARCHAR(80)  DEFAULT 'NUEVA TEMPORADA',
    ADD COLUMN IF NOT EXISTS hero_badge_text         VARCHAR(80)  DEFAULT 'STOCK LIMITADO',
    ADD COLUMN IF NOT EXISTS hero_secondary_cta_text VARCHAR(60)  DEFAULT 'PREGUNTA POR WHATSAPP',
    ADD COLUMN IF NOT EXISTS hero_stat_one_value     VARCHAR(40)  DEFAULT '+50',
    ADD COLUMN IF NOT EXISTS hero_stat_one_label     VARCHAR(100) DEFAULT 'REFERENCIAS ACTIVAS',
    ADD COLUMN IF NOT EXISTS hero_stat_two_value     VARCHAR(40)  DEFAULT 'WHATSAPP',
    ADD COLUMN IF NOT EXISTS hero_stat_two_label     VARCHAR(100) DEFAULT 'ATENCIÓN RÁPIDA Y DIRECTA',
    ADD COLUMN IF NOT EXISTS hero_stat_three_value   VARCHAR(40)  DEFAULT 'CURADOS',
    ADD COLUMN IF NOT EXISTS hero_stat_three_label   VARCHAR(100) DEFAULT 'SELECCIÓN CON ESTILO Y CONFIANZA';
