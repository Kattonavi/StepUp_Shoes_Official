# Control Center — StepUp

## Descripción

El Control Center es un módulo exclusivo para el rol `SUPER_ADMIN`. Es completamente inaccesible para OWNER, ADMIN, EDITOR y VIEWER. Cualquier intento de acceso retorna `403 Forbidden`.

## Acceso

- **URL frontend**: `/admin/control-center`
- **Endpoint backend**: `/api/v1/control-center/*`
- **Protección**: Spring Security verifica `ROLE_SUPER_ADMIN` en cada request al prefijo `/control-center/`

## Funcionalidades

### 1. Historial global de cambios

Muestra todos los `audit_logs` del sistema, sin filtrar por usuario:
- Qué acción se realizó (CREATE, UPDATE, DELETE, LOGIN, etc.)
- Sobre qué entidad (producto, categoría, usuario, etc.)
- Quién la realizó (nombre, email, rol)
- Cuándo (fecha/hora con timezone)
- IP hash (no IP real)
- Descripción legible

Filtros disponibles:
- Por tipo de acción
- Por entidad
- Por usuario
- Por rango de fechas

### 2. Auditoría de acciones administrativas

Muestra los eventos de `admin_activity`:
- Acciones críticas: cambios de rol, bloqueos, accesos al control center
- Actividad de login/logout

### 3. Elementos eliminados

Lista todas las entidades con `deleted_at IS NOT NULL`:
- Productos eliminados
- Categorías eliminadas
- Usuarios eliminados (soft)

Incluye: fecha de eliminación, quién eliminó, y opción de restaurar.

### 4. Restauración de entidades

Flujo de restauración:
1. SUPER_ADMIN selecciona el elemento eliminado.
2. Se muestra el snapshot previo a la eliminación (before_data del último DELETE snapshot).
3. SUPER_ADMIN confirma la restauración con razón opcional.
4. El sistema ejecuta:
   - Setea `deleted_at = null` y `deleted_by = null` en la entidad.
   - Crea un `restore_action` con referencia al snapshot.
   - Crea un `audit_log` con `accion = 'RESTORE'`.

### 5. Restauración de versiones anteriores

Flujo:
1. SUPER_ADMIN abre el historial de snapshots de una entidad.
2. Se lista cronológicamente con comparación before/after.
3. SUPER_ADMIN selecciona la versión a restaurar.
4. El sistema aplica el `before_data` del snapshot seleccionado sobre la entidad actual.
5. Se registra en `restore_actions` y `audit_logs`.

### 6. Comparación before/after

Visualización diff de dos snapshots:
- Campos modificados resaltados
- Valores anteriores (rojo/tachado) vs valores nuevos (verde)
- Fecha, autor del cambio, acción realizada

### 7. Actividad crítica

Monitor de eventos inusuales:
- Múltiples intentos de login fallidos
- Cambios de rol ejecutados recientemente
- Accesos desde IPs hash nuevas (requiere tracking futuro)
- Usuarios bloqueados/desbloqueados

### 8. Seguridad

Panel de seguridad:
- Lista de usuarios administrativos con estado
- Usuarios bloqueados
- Historial de cambios de roles
- Bloqueo/desbloqueo de cuentas con razón

## API del Control Center

| Endpoint                                     | Descripción                          |
|----------------------------------------------|--------------------------------------|
| `GET /control-center/audit-logs`             | Historial paginado con filtros       |
| `GET /control-center/deleted-items`          | Entidades eliminadas por tipo        |
| `GET /control-center/snapshots/{entidadId}`  | Snapshots de una entidad             |
| `GET /control-center/snapshots/detail/{id}`  | Detalle de un snapshot               |
| `POST /control-center/restore/{snapshotId}`  | Restaurar desde un snapshot          |
| `GET /control-center/restore-actions`        | Historial de restauraciones          |
| `GET /control-center/security/activity`      | Actividad crítica de seguridad       |

## Implementación en el backend

```java
@RestController
@RequestMapping("/api/v1/control-center")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class ControlCenterController {
    // Todos los endpoints del Control Center verifican SUPER_ADMIN
}
```

La anotación `@PreAuthorize("hasRole('SUPER_ADMIN')")` a nivel de clase aplica a todos los métodos.

Adicionalmente, Spring Security tiene una regla explícita en `SecurityConfig`:

```java
.requestMatchers("/api/v1/control-center/**").hasRole("SUPER_ADMIN")
```

Doble protección: configuración de rutas + anotación de método.

## Frontend — Control Center

**URL**: `/admin/control-center`

El layout del admin verifica el rol del usuario y redirige si no es SUPER_ADMIN.

```tsx
// Verificación en el layout admin
if (user.role !== 'SUPER_ADMIN') {
  redirect('/admin'); // o mostrar 403
}
```

La ruta `/admin/control-center` no aparece en el menú lateral para ningún usuario diferente de SUPER_ADMIN.

## Restricciones técnicas importantes

1. **No se puede hacer DELETE en `audit_logs`** desde la aplicación. Solo DBA con acceso directo puede hacerlo.
2. **No se puede hacer DELETE en `entity_snapshots`** desde la aplicación.
3. **No se puede hacer UPDATE en `audit_logs`** desde la aplicación.
4. Las restauraciones crean registros nuevos; nunca modifican ni eliminan snapshots existentes.

## TODO por fases

| Funcionalidad                     | Fase | Estado  |
|-----------------------------------|------|---------|
| Ruta y layout placeholder         | 0    | ✅      |
| Backend endpoint protegido        | 0    | ✅      |
| Audit logs reales (tablas)        | 3    | Pendiente |
| Snapshots before/after            | 3    | Pendiente |
| Restauración de entidades         | 3    | Pendiente |
| UI completa del Control Center    | 5    | Pendiente |
| Comparación visual before/after   | 5    | Pendiente |
| Monitor de actividad crítica      | 8    | Pendiente |
