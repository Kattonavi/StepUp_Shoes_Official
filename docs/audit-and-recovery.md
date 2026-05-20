# Auditoría y Restauración — StepUp

## Objetivo

Proporcionar un sistema de auditoría completo y una funcionalidad de restauración tipo "Ctrl + Z" para el SUPER_ADMIN: capacidad de ver qué cambió, quién lo cambió, cuándo, y revertirlo si es necesario.

## Componentes del sistema

### 1. Soft Delete

Las entidades importantes no se eliminan físicamente. Se marcan con:
```sql
deleted_at  TIMESTAMPTZ  -- Fecha de eliminación
deleted_by  UUID         -- Usuario que eliminó
```

Entidades con soft delete:
- `products`
- `categories`
- `users`

Entidades sin soft delete (se eliminan físicamente o no aplica):
- `product_images` (ON DELETE CASCADE con product)
- `product_sizes` (ON DELETE CASCADE con product)
- `messages` (eliminación física permitida)
- `refresh_tokens` (se revocan)

### 2. Entity Snapshots

Antes de cada `UPDATE` o `DELETE` en entidades críticas, se guarda un snapshot en `entity_snapshots`:

```sql
entity_snapshots {
  id          UUID        -- ID del snapshot
  entidad     VARCHAR(50) -- 'product', 'category', 'user', 'store_settings', etc.
  entidad_id  UUID        -- ID de la entidad afectada
  accion      VARCHAR(20) -- 'CREATE', 'UPDATE', 'DELETE'
  before_data JSONB       -- Estado antes del cambio (null si CREATE)
  after_data  JSONB       -- Estado después del cambio (null si DELETE)
  user_id     UUID        -- Quién hizo el cambio
  created_at  TIMESTAMPTZ -- Cuándo
}
```

Entidades auditadas con snapshots:
- `products` (incluyendo imágenes y tallas cuando aplique)
- `categories`
- `users`
- `store_settings`

### 3. Audit Logs

Registro de eventos de alto nivel:

```sql
audit_logs {
  id          UUID
  user_id     UUID        -- Quién
  accion      VARCHAR(50) -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, RESTORE, ROLE_CHANGE, BLOCK
  entidad     VARCHAR(50) -- 'product', 'category', 'user', etc.
  entidad_id  UUID        -- ID afectado
  descripcion TEXT        -- Descripción legible
  ip_hash     VARCHAR(64) -- Hash de IP (no la IP real)
  user_agent  VARCHAR(500)
  created_at  TIMESTAMPTZ
}
```

### 4. Restore Actions

Registro de cada restauración realizada:

```sql
restore_actions {
  id          UUID
  snapshot_id UUID        -- El snapshot desde el que se restauró
  entidad     VARCHAR(50)
  entidad_id  UUID
  restored_by UUID        -- SUPER_ADMIN que restauró
  razon       TEXT        -- Razón opcional
  created_at  TIMESTAMPTZ
}
```

## Flujo de auditoría por acción

### CREATE
```
Usuario → Service.create(dto) →
  1. Guardar entidad en BD
  2. entity_snapshots.save({ accion:'CREATE', before_data: null, after_data: entity })
  3. audit_logs.save({ accion:'CREATE', entidad, entidad_id })
```

### UPDATE
```
Usuario → Service.update(id, dto) →
  1. Cargar entidad actual → guardar como before_data
  2. Actualizar entidad en BD → after_data
  3. entity_snapshots.save({ accion:'UPDATE', before_data, after_data })
  4. audit_logs.save({ accion:'UPDATE', entidad, entidad_id })
```

### DELETE (soft)
```
Usuario → Service.delete(id) →
  1. Cargar entidad actual → guardar como before_data
  2. Setear deleted_at y deleted_by en BD
  3. entity_snapshots.save({ accion:'DELETE', before_data, after_data: null })
  4. audit_logs.save({ accion:'DELETE', entidad, entidad_id })
```

### RESTORE (solo SUPER_ADMIN)
```
SUPER_ADMIN → ControlCenter.restore(snapshotId) →
  1. Cargar snapshot
  2. Cargar entidad actual (deleted o versionada)
  3. Aplicar before_data del snapshot → actualizar entidad
  4. Si era soft-deleted: setear deleted_at=null, deleted_by=null
  5. entity_snapshots.save({ accion:'UPDATE', before_data: estado_actual, after_data: restaurado })
  6. restore_actions.save({ snapshot_id, entidad, entidad_id, restored_by, razon })
  7. audit_logs.save({ accion:'RESTORE', entidad, entidad_id })
```

## Implementación en el backend

### Aspecto / Interceptor

```java
// TODO(phase-3): Implementar AuditAspect con @Around para métodos de servicio
@Aspect
@Component
public class AuditAspect {
    @Around("@annotation(Auditable)")
    public Object audit(ProceedingJoinPoint pjp, Auditable auditable) throws Throwable {
        // Capturar before, ejecutar, capturar after, guardar snapshot + log
    }
}

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String entity();
    AuditAction action();
}
```

### Uso en servicios

```java
@Auditable(entity = "product", action = AuditAction.UPDATE)
public ProductResponse updateProduct(UUID id, UpdateProductRequest request) {
    // ...
}
```

### Reglas de protección

```java
// En AuditLogRepository — NO exponer métodos de delete/update
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    // Solo operaciones de lectura y save
    // Prohibido: deleteById, delete, deleteAll, etc.
}
```

## Qué guardar en before_data / after_data

Para `products`:
```json
{
  "id": "uuid",
  "nombre": "Air Max 90",
  "slug": "air-max-90",
  "precioActual": 120.00,
  "estado": "ACTIVE",
  "en_rebaja": false,
  "tallas": [
    { "talla": "42", "stock": 5 }
  ]
}
```

No incluir: campos derivados, relaciones completas innecesarias, campos binarios/blob.

## Retención y limpieza

- `audit_logs`: Retención indefinida. Solo DBA puede purgar.
- `entity_snapshots`: Retención indefinida. Solo DBA puede purgar.
- `restore_actions`: Retención indefinida.
- `analytics_events`: Se pueden purgar datos de más de 2 años **TODO(phase-8)**.

## Entidades auditadas por fase

| Entidad           | Fase en que se implementa |
|-------------------|--------------------------|
| products          | Fase 3                   |
| categories        | Fase 3                   |
| users             | Fase 3                   |
| store_settings    | Fase 3                   |
| product_images    | Fase 3                   |
| product_sizes     | Fase 3                   |
| messages          | Fase 6 (si aplica)       |
| analytics_events  | No aplica (append-only)  |
