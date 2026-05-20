-- ============================================================
-- V12__create_store_settings.sql
-- Configuración global de la tienda (singleton).
-- singleton_key = 'GLOBAL' garantiza un único registro vía UNIQUE constraint.
-- ============================================================

CREATE TABLE IF NOT EXISTS store_settings (
    id                          UUID         NOT NULL DEFAULT gen_random_uuid(),
    singleton_key               VARCHAR(10)  NOT NULL DEFAULT 'GLOBAL',

    -- Identidad
    store_name                  VARCHAR(255) NOT NULL DEFAULT 'StepUp',
    store_slogan                VARCHAR(500),
    logo_url                    VARCHAR(1000),
    favicon_url                 VARCHAR(1000),

    -- Contacto
    whatsapp_number             VARCHAR(50),
    whatsapp_default_message    VARCHAR(500),
    contact_email               VARCHAR(255),
    contact_phone               VARCHAR(50),
    address                     VARCHAR(500),
    city                        VARCHAR(100),
    country                     VARCHAR(100),

    -- Redes sociales
    instagram_url               VARCHAR(1000),
    facebook_url                VARCHAR(1000),
    tiktok_url                  VARCHAR(1000),
    youtube_url                 VARCHAR(1000),

    -- SEO global
    seo_title                   VARCHAR(255),
    seo_description             VARCHAR(500),
    seo_keywords                VARCHAR(500),
    og_image_url                VARCHAR(1000),

    -- Sección Home
    hero_title                  VARCHAR(255),
    hero_subtitle               VARCHAR(500),
    hero_cta_text               VARCHAR(100),
    hero_cta_url                VARCHAR(500),
    featured_section_title      VARCHAR(255),
    new_arrivals_section_title  VARCHAR(255),

    -- Operación
    maintenance_mode            BOOLEAN      NOT NULL DEFAULT FALSE,
    maintenance_message         VARCHAR(500),
    catalog_enabled             BOOLEAN      NOT NULL DEFAULT TRUE,
    whatsapp_enabled            BOOLEAN      NOT NULL DEFAULT TRUE,

    -- Auditoría
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_by                  UUID,

    CONSTRAINT store_settings_pkey         PRIMARY KEY (id),
    CONSTRAINT store_settings_singleton    UNIQUE (singleton_key),
    CONSTRAINT store_settings_name_check   CHECK (store_name <> '')
);

-- Insert default settings immediately so the row always exists
INSERT INTO store_settings (
    singleton_key, store_name, store_slogan,
    hero_title, hero_subtitle, hero_cta_text, hero_cta_url,
    featured_section_title, new_arrivals_section_title,
    maintenance_mode, catalog_enabled, whatsapp_enabled
) VALUES (
    'GLOBAL', 'StepUp', 'Catálogo urbano de zapatos, ropa y accesorios.',
    'Encuentra tu próximo estilo', 'Productos seleccionados con atención personalizada.',
    'Ver catálogo', '/catalogo',
    'Productos destacados', 'Nuevos productos',
    FALSE, TRUE, TRUE
) ON CONFLICT (singleton_key) DO NOTHING;
