-- ============================================================
-- V11__create_messages.sql
-- Mensajes de contacto enviados desde el formulario público.
-- No usa FK a products: los mensajes persisten aunque el producto
-- sea eliminado. productName se desnormaliza en el momento de creación.
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (
    id              UUID         NOT NULL DEFAULT gen_random_uuid(),
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(50),
    subject         VARCHAR(500),
    content         TEXT         NOT NULL,
    product_id      UUID,                         -- loose reference, no FK
    product_name    VARCHAR(255),                 -- denormalized at creation
    source          VARCHAR(30)  NOT NULL DEFAULT 'CONTACT_FORM',
    status          VARCHAR(20)  NOT NULL DEFAULT 'UNREAD',
    internal_notes  TEXT,
    read_at         TIMESTAMPTZ,
    read_by         UUID,
    archived_at     TIMESTAMPTZ,
    archived_by     UUID,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    deleted_by      UUID,

    CONSTRAINT messages_pkey                PRIMARY KEY (id),
    CONSTRAINT messages_content_not_blank   CHECK (content <> ''),
    CONSTRAINT messages_full_name_not_blank CHECK (full_name <> ''),
    CONSTRAINT messages_email_or_phone      CHECK (email IS NOT NULL OR phone IS NOT NULL),
    CONSTRAINT messages_status_valid        CHECK (status IN ('UNREAD', 'READ', 'ARCHIVED', 'DELETED')),
    CONSTRAINT messages_source_valid        CHECK (source IN (
        'CONTACT_FORM', 'PRODUCT_INQUIRY', 'WHATSAPP_CTA', 'ADMIN_CREATED', 'SYSTEM'
    ))
);

CREATE INDEX idx_messages_status      ON messages (status);
CREATE INDEX idx_messages_source      ON messages (source);
CREATE INDEX idx_messages_product_id  ON messages (product_id);
CREATE INDEX idx_messages_created_at  ON messages (created_at DESC);
CREATE INDEX idx_messages_deleted_at  ON messages (deleted_at);
CREATE INDEX idx_messages_read_at     ON messages (read_at);
CREATE INDEX idx_messages_archived_at ON messages (archived_at);
