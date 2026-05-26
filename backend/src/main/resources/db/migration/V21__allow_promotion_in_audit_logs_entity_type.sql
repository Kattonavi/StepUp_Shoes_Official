-- ============================================================
-- V21__allow_promotion_in_audit_logs_entity_type.sql
--
-- El enum Java `AuditableEntityType` ya incluye PROMOTION desde el módulo
-- de promociones, pero el CHECK constraint creado en V8 nunca se actualizó.
-- Esto provoca:
--   ERROR: new row for relation "audit_logs" violates check constraint
--          "audit_logs_entity_type_valid"
-- cada vez que se crea/edita/borra una promoción y el AuditLogService
-- intenta registrar el evento.
--
-- Esta migración:
--   - drop del CHECK viejo (no eliminamos la columna ni filas),
--   - re-añade el CHECK incluyendo PROMOTION,
--   - mantiene TODOS los entity types ya soportados.
--
-- `entity_snapshots` y `restore_actions` no tienen CHECK de entity_type
-- (verificado en V9 y V10), por lo que no requieren cambios.
-- ============================================================

ALTER TABLE audit_logs
    DROP CONSTRAINT IF EXISTS audit_logs_entity_type_valid;

ALTER TABLE audit_logs
    ADD CONSTRAINT audit_logs_entity_type_valid CHECK (entity_type IN (
        'USER',
        'PRODUCT',
        'CATEGORY',
        'PRODUCT_IMAGE',
        'PRODUCT_SIZE',
        'STORE_SETTINGS',
        'MESSAGE',
        'PROMOTION',
        'SYSTEM'
    ));
