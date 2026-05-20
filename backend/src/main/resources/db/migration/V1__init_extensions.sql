-- ============================================================
-- V1__init_extensions.sql
-- Habilitar extensiones PostgreSQL necesarias para StepUp.
-- ============================================================

-- pgcrypto provee gen_random_uuid() para generar UUIDs v4 en PostgreSQL.
-- uuid-ossp es la alternativa más antigua, pero pgcrypto es suficiente y está en el core.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- pg_trgm habilita búsqueda por similitud de texto (útil para búsquedas en catálogo).
-- TODO(phase-2): Verificar que pg_trgm está instalado en el servidor de producción (Railway).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- Las tablas se crearán en migraciones posteriores:
-- V2__users.sql              (Fase 1)
-- V3__refresh_tokens.sql     (Fase 1)
-- V4__categories.sql         (Fase 2)
-- V5__products.sql           (Fase 2)
-- V6__product_images.sql     (Fase 2)
-- V7__product_sizes.sql      (Fase 2)
-- V8__messages.sql           (Fase 6)
-- V9__analytics_events.sql   (Fase 6)
-- V10__store_settings.sql    (Fase 6)
-- V11__audit_logs.sql        (Fase 3)
-- V12__entity_snapshots.sql  (Fase 3)
-- V13__restore_actions.sql   (Fase 3)
-- V14__admin_activity.sql    (Fase 3)
-- ============================================================
