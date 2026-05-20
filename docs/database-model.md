# Modelo de base de datos — StepUp

## Convenciones

- IDs: `UUID` (generado por base de datos con `gen_random_uuid()`)
- Timestamps: `TIMESTAMPTZ` (con timezone)
- Soft delete: columnas `deleted_at TIMESTAMPTZ` y `deleted_by UUID`
- Booleanos: `BOOLEAN` real, no `INTEGER`
- Slugs: `VARCHAR` único con índice
- JSON flexible: `JSONB`
- Nombres de tablas: snake_case, plural

---

## Tablas

### `users`
```sql
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nombre          VARCHAR(255) NOT NULL,
    role            VARCHAR(50)  NOT NULL CHECK (role IN ('SUPER_ADMIN','OWNER','ADMIN','EDITOR','VIEWER')),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    blocked_at      TIMESTAMPTZ,
    blocked_by      UUID        REFERENCES users(id),
    blocked_reason  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    deleted_by      UUID        REFERENCES users(id)
);

CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_role         ON users(role);
CREATE INDEX idx_users_deleted_at   ON users(deleted_at) WHERE deleted_at IS NULL;
```

### `refresh_tokens`
```sql
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

### `categories`
```sql
CREATE TABLE categories (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    icono       VARCHAR(100),
    descripcion TEXT,
    posicion    INTEGER     NOT NULL DEFAULT 0,
    activa      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    deleted_by  UUID        REFERENCES users(id)
);

CREATE INDEX idx_categories_slug       ON categories(slug);
CREATE INDEX idx_categories_activa     ON categories(activa) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at) WHERE deleted_at IS NULL;
```

### `products`
```sql
CREATE TABLE products (
    id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre               VARCHAR(255)   NOT NULL,
    slug                 VARCHAR(255)   NOT NULL UNIQUE,
    descripcion          TEXT,
    category_id          UUID           REFERENCES categories(id),
    precio_actual        NUMERIC(10,2)  NOT NULL,
    precio_anterior      NUMERIC(10,2),
    porcentaje_descuento INTEGER,
    estado               VARCHAR(20)    NOT NULL DEFAULT 'DRAFT'
                           CHECK (estado IN ('ACTIVE','DRAFT','HIDDEN','DELETED')),
    stock_status         VARCHAR(20)    NOT NULL DEFAULT 'AVAILABLE'
                           CHECK (stock_status IN ('AVAILABLE','OUT_OF_STOCK','ON_REQUEST')),
    es_nuevo             BOOLEAN        NOT NULL DEFAULT FALSE,
    en_rebaja            BOOLEAN        NOT NULL DEFAULT FALSE,
    es_destacado         BOOLEAN        NOT NULL DEFAULT FALSE,
    seo_title            VARCHAR(255),
    seo_description      TEXT,
    orden                INTEGER        NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    deleted_at           TIMESTAMPTZ,
    deleted_by           UUID           REFERENCES users(id)
);

CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_category    ON products(category_id);
CREATE INDEX idx_products_estado      ON products(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_destacado   ON products(es_destacado) WHERE deleted_at IS NULL AND estado = 'ACTIVE';
CREATE INDEX idx_products_deleted_at  ON products(deleted_at) WHERE deleted_at IS NULL;
```

### `product_images`
```sql
CREATE TABLE product_images (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         TEXT        NOT NULL,
    alt_text    VARCHAR(255),
    es_principal BOOLEAN    NOT NULL DEFAULT FALSE,
    orden       INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_principal  ON product_images(product_id, es_principal);
```

### `product_sizes`
```sql
CREATE TABLE product_sizes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    talla       VARCHAR(20) NOT NULL,
    stock       INTEGER     NOT NULL DEFAULT 0,
    activa      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, talla)
);

CREATE INDEX idx_product_sizes_product_id ON product_sizes(product_id);
```

### `messages`
```sql
CREATE TABLE messages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    telefono        VARCHAR(50),
    mensaje         TEXT        NOT NULL,
    product_id      UUID        REFERENCES products(id) ON DELETE SET NULL,
    leido           BOOLEAN     NOT NULL DEFAULT FALSE,
    notas_internas  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_leido      ON messages(leido);
CREATE INDEX idx_messages_product_id ON messages(product_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### `analytics_events`
```sql
CREATE TABLE analytics_events (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo        VARCHAR(50) NOT NULL
                  CHECK (tipo IN ('PRODUCT_VIEW','CATEGORY_VIEW','WHATSAPP_CLICK','PAGE_VIEW')),
    entidad_id  UUID,
    metadata    JSONB,
    ip_hash     VARCHAR(64),
    user_agent  VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_tipo        ON analytics_events(tipo);
CREATE INDEX idx_analytics_entidad_id  ON analytics_events(entidad_id);
CREATE INDEX idx_analytics_created_at  ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_tipo_fecha  ON analytics_events(tipo, created_at DESC);
```

### `store_settings`
```sql
CREATE TABLE store_settings (
    id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                 VARCHAR(255) NOT NULL DEFAULT 'StepUp',
    logo_url               TEXT,
    whatsapp               VARCHAR(50),
    mensaje_base_whatsapp  TEXT,
    redes_sociales         JSONB       DEFAULT '{}',
    texto_home             TEXT,
    seo_title              VARCHAR(255),
    seo_description        TEXT,
    og_image_url           TEXT,
    en_mantenimiento       BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by             UUID        REFERENCES users(id)
);
```

### `audit_logs`
```sql
CREATE TABLE audit_logs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    accion      VARCHAR(50) NOT NULL,
    entidad     VARCHAR(50) NOT NULL,
    entidad_id  UUID,
    descripcion TEXT,
    ip_hash     VARCHAR(64),
    user_agent  VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROHIBIDO: DELETE, UPDATE en audit_logs desde la aplicación.
CREATE INDEX idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entidad    ON audit_logs(entidad, entidad_id);
CREATE INDEX idx_audit_logs_accion     ON audit_logs(accion);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### `entity_snapshots`
```sql
CREATE TABLE entity_snapshots (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad     VARCHAR(50) NOT NULL,
    entidad_id  UUID        NOT NULL,
    accion      VARCHAR(20) NOT NULL CHECK (accion IN ('CREATE','UPDATE','DELETE')),
    before_data JSONB,
    after_data  JSONB,
    user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROHIBIDO: DELETE, UPDATE en entity_snapshots desde la aplicación.
CREATE INDEX idx_snapshots_entidad_id  ON entity_snapshots(entidad, entidad_id);
CREATE INDEX idx_snapshots_created_at  ON entity_snapshots(created_at DESC);
CREATE INDEX idx_snapshots_user_id     ON entity_snapshots(user_id);
```

### `restore_actions`
```sql
CREATE TABLE restore_actions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id     UUID        NOT NULL REFERENCES entity_snapshots(id),
    entidad         VARCHAR(50) NOT NULL,
    entidad_id      UUID        NOT NULL,
    restored_by     UUID        NOT NULL REFERENCES users(id),
    razon           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_restore_entidad    ON restore_actions(entidad, entidad_id);
CREATE INDEX idx_restore_created_at ON restore_actions(created_at DESC);
```

### `admin_activity`
```sql
CREATE TABLE admin_activity (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tipo        VARCHAR(50) NOT NULL,
    descripcion TEXT,
    metadata    JSONB,
    ip_hash     VARCHAR(64),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_activity_user_id    ON admin_activity(user_id);
CREATE INDEX idx_admin_activity_tipo       ON admin_activity(tipo);
CREATE INDEX idx_admin_activity_created_at ON admin_activity(created_at DESC);
```

---

## Diagrama de relaciones (ERD simplificado)

```
users ─────────────────────────────────────────────────┐
  │ created_by, deleted_by, updated_by               │
  │                                                   │
  ├── products (deleted_by → users.id)               │
  │     ├── product_images                            │
  │     └── product_sizes                             │
  │                                                   │
  ├── categories (deleted_by → users.id)             │
  │                                                   │
  ├── messages (leido por admin)                     │
  │                                                   │
  ├── refresh_tokens (user_id → users.id)            │
  │                                                   │
  ├── audit_logs (user_id → users.id)                │
  ├── entity_snapshots (user_id → users.id)          │
  ├── restore_actions (restored_by → users.id)       │
  ├── admin_activity (user_id → users.id)            │
  │                                                   │
  └── store_settings (updated_by → users.id)        │
                                                      │
analytics_events (standalone, no FK críticos)       │
                                                      │
refresh_tokens ────────────────────────────────────────┘
```

## Estado de migraciones Flyway

| Migración | Estado | Descripción |
|-----------|--------|-------------|
| V1__init_extensions.sql | ✅ | pgcrypto, pg_trgm |
| V2__create_users.sql | ✅ | Tabla users |
| V3__create_refresh_tokens.sql | ✅ | Refresh tokens |
| V4__create_categories.sql | ✅ | Categorías con soft delete |
| V5__create_products.sql | ✅ | Productos con soft delete y enums de estado |
| V6__create_product_images.sql | ✅ | Imágenes (URL-only, upload en Fase futura) |
| V7__create_product_sizes.sql | ✅ | Tallas e inventario básico |
| V8__create_audit_logs.sql | ✅ | Logs inmutables de auditoría |
| V9__create_entity_snapshots.sql | ✅ | Snapshots JSONB before/after |
| V10__create_restore_actions.sql | ✅ | Historial de restauraciones |
| V11__messages.sql | ⏳ Fase 6 | Mensajes de contacto |
| V12__analytics_events.sql | ⏳ Fase 6 | Eventos de analítica |
| V13__store_settings.sql | ⏳ Fase 6 | Configuración de tienda |

## Soft delete — Reglas generales

- `deletedAt = null` → entidad activa
- `deletedAt != null` → entidad eliminada (soft)
- Listados públicos siempre filtran `deletedAt IS NULL`
- Admin puede ver eliminados con `includeDeleted=true` (OWNER/SUPER_ADMIN)
- El restore básico (Fase 2) solo limpia `deletedAt/deletedBy`; auditoría completa en Fase 3

## Notas de implementación real (Fase 2)

Las columnas reales en DB difieren ligeramente del diseño conceptual original (que usaba español):

| Concepto | Nombre en DB | Nota |
|----------|-------------|------|
| nombre | name | inglés por convención JPA |
| activa | active | |
| posicion | position | |
| estado | status | enum VARCHAR |
| es_nuevo | is_new | |
| en_rebaja | is_on_sale | |
| es_destacado | is_featured | |
| visible | visible | controla acceso público |
| precio_actual | price | |
| precio_anterior | old_price | nullable |
| porcentaje_descuento | discount_percentage | 0-100 |
