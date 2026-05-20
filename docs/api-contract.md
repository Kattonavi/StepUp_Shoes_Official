# Contrato API REST — StepUp

## Base URL

- **Desarrollo**: `http://localhost:8080/api/v1`
- **Producción**: `https://stepup-backend.railway.app/api/v1`

## Convenciones

- Todas las respuestas son `application/json`
- Respuesta exitosa: `{ "success": true, "data": {...}, "message": null }`
- Respuesta de error: `{ "success": false, "data": null, "message": "...", "errors": [...] }`
- Paginación: `{ "content": [...], "page": 0, "size": 20, "totalElements": 100, "totalPages": 5 }`
- Fechas en ISO 8601: `2025-01-15T10:30:00Z`
- IDs en formato UUID v4

## Leyenda de acceso

| Símbolo | Significado                       |
|---------|-----------------------------------|
| 🌐      | Público (sin autenticación)       |
| 🔐      | Requiere JWT válido               |
| 👤      | VIEWER o superior                 |
| ✏️      | EDITOR o superior                 |
| 🛡️      | ADMIN o superior                  |
| 👑      | OWNER o superior                  |
| ⚡      | Solo SUPER_ADMIN                  |

---

## Health

| Método | Endpoint              | Acceso | Descripción            |
|--------|-----------------------|--------|------------------------|
| GET    | `/health`             | 🌐     | Estado del servicio    |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "version": "0.1.0",
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

## Public

| Método | Endpoint              | Acceso | Descripción                |
|--------|-----------------------|--------|----------------------------|
| GET    | `/public/info`        | 🌐     | Información pública de API |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "app": "StepUp API",
    "version": "0.1.0",
    "environment": "dev",
    "description": "StepUp e-commerce API"
  }
}
```

---

## Auth

| Método | Endpoint              | Acceso | Descripción              |
|--------|-----------------------|--------|--------------------------|
| POST   | `/auth/login`         | 🌐     | Obtener tokens           |
| POST   | `/auth/refresh`       | 🌐     | Renovar access token     |
| POST   | `/auth/logout`        | 🔐     | Invalidar refresh token  |
| GET    | `/auth/me`            | 🔐     | Info del usuario actual  |

**POST /auth/login — Request:**
```json
{ "email": "admin@stepup.com", "password": "secure123" }
```

**POST /auth/login — Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "admin@stepup.com",
      "nombre": "Admin",
      "role": "ADMIN"
    }
  }
}
```

---

## Products ✅ Fase 2

| Método | Endpoint                           | Acceso | Descripción                            |
|--------|------------------------------------|--------|----------------------------------------|
| GET    | `/products`                        | 🌐     | Catálogo público (ACTIVE+visible)      |
| GET    | `/products/{id}`                   | 🌐/🔐  | Por ID (público: solo visible+ACTIVE)  |
| GET    | `/products/slug/{slug}`            | 🌐     | Por slug (solo visible+ACTIVE)         |
| GET    | `/products/admin`                  | 🛡️     | Admin: incluye DRAFT/HIDDEN            |
| POST   | `/products`                        | ✏️     | Crear producto                         |
| PUT    | `/products/{id}`                   | ✏️     | Actualizar producto completo           |
| PATCH  | `/products/{id}/visibility`        | ✏️     | Cambiar visible true/false             |
| PATCH  | `/products/{id}/stock`             | ✏️     | Cambiar stockStatus + tallas           |
| PATCH  | `/products/{id}/status`            | 🛡️     | Cambiar ACTIVE/DRAFT/HIDDEN            |
| DELETE | `/products/{id}`                   | 👑     | Soft delete (status=DELETED)           |
| POST   | `/products/{id}/restore`           | 👑     | Restore básico → DRAFT + visible=false |

**Query params para GET /products (catálogo público):**
```
?categorySlug=sneakers
&search=nike
&minPrice=50
&maxPrice=200
&stockStatus=AVAILABLE
&isNew=true
&isOnSale=true
&isFeatured=true
&sort=newest|price_asc|price_desc|name_asc|featured
&page=0
&size=20
```

**POST /products — Request:**
```json
{
  "name": "Nike Air Max 90",
  "slug": "nike-air-max-90",
  "description": "El clásico reinventado.",
  "categoryId": "uuid-categoria",
  "price": 129.99,
  "oldPrice": 159.99,
  "discountPercentage": 19,
  "status": "ACTIVE",
  "stockStatus": "AVAILABLE",
  "isNew": true,
  "isOnSale": true,
  "isFeatured": false,
  "visible": true,
  "seoTitle": "Nike Air Max 90 - StepUp",
  "seoDescription": "Compra las Nike Air Max 90...",
  "images": [
    { "url": "https://cdn.example.com/img.jpg", "altText": "Vista frontal", "mainImage": true }
  ],
  "sizes": [
    { "size": "42", "stockQuantity": 5, "available": true },
    { "size": "43", "stockQuantity": 3, "available": true }
  ]
}
```

### Reglas de negocio — Productos
- `status=ACTIVE + visible=true + deletedAt=null` → aparece en catálogo público.
- `status=DRAFT|HIDDEN` → no aparece públicamente.
- `isOnSale=true` → requiere `oldPrice` o `discountPercentage`.
- Al hacer DELETE: status=DELETED, visible=false, deletedAt=now, deletedBy=userId.
- Restore: status=DRAFT, visible=false, deletedAt=null. Auditoría completa en Fase 3.
- EDITOR puede crear/editar productos pero no eliminarlos ni cambiar su status a DELETED.

---

## Categories ✅ Fase 2

| Método | Endpoint                           | Acceso | Descripción                              |
|--------|------------------------------------|--------|------------------------------------------|
| GET    | `/categories`                      | 🌐     | Listar activas (admin puede ver inactivas)|
| GET    | `/categories/{id}`                 | 🌐     | Por ID                                   |
| GET    | `/categories/slug/{slug}`          | 🌐     | Por slug                                 |
| POST   | `/categories`                      | 🛡️     | Crear categoría                          |
| PUT    | `/categories/{id}`                 | 🛡️     | Actualizar categoría                     |
| PATCH  | `/categories/{id}/status`          | 🛡️     | Activar/desactivar                       |
| DELETE | `/categories/{id}`                 | 👑     | Soft delete (falla si tiene productos)   |
| POST   | `/categories/{id}/restore`         | 👑     | Restore básico → active=false            |

**Query params para GET /categories:**
```
?includeInactive=true   (solo autenticados)
?includeDeleted=true    (solo autenticados)
?sortBy=position&sortDir=asc
?page=0&size=20
```

**POST /categories — Request:**
```json
{
  "name": "Sneakers",
  "slug": "sneakers",
  "icon": "👟",
  "description": "Zapatillas deportivas y urbanas",
  "position": 1,
  "active": true
}
```

### Reglas de negocio — Categorías
- Si no se envía `slug`, se genera desde `name` (normalizado, sin acentos, snake-case).
- Si el slug ya existe, se añade sufijo incremental: `zapatos`, `zapatos-2`, `zapatos-3`.
- Soft delete rechazado si la categoría tiene productos con `deletedAt=null` (Estrategia A).
- Restore: active=false (admin debe activar manualmente). Auditoría completa en Fase 3.

---

## Messages

| Método | Endpoint                           | Acceso | Descripción              |
|--------|------------------------------------|--------|--------------------------|
| GET    | `/messages`                        | 🛡️     | Listar mensajes          |
| POST   | `/messages`                        | 🌐     | Crear mensaje (público)  |
| PATCH  | `/messages/{id}/read`              | 🛡️     | Marcar como leído        |
| DELETE | `/messages/{id}`                   | 👑     | Eliminar mensaje         |

---

## Analytics

| Método | Endpoint                           | Acceso | Descripción              |
|--------|------------------------------------|--------|--------------------------|
| GET    | `/analytics/dashboard`             | 🛡️     | Métricas del dashboard   |
| GET    | `/analytics/products`              | 🛡️     | Analíticas por producto  |
| POST   | `/analytics/events`                | 🌐     | Registrar evento         |

**POST /analytics/events — Request:**
```json
{
  "tipo": "PRODUCT_VIEW",
  "entidadId": "uuid-del-producto"
}
```

---

## Users

| Método | Endpoint                           | Acceso | Descripción              |
|--------|------------------------------------|--------|--------------------------|
| GET    | `/users`                           | 👑     | Listar usuarios          |
| POST   | `/users`                           | 👑     | Crear usuario            |
| PUT    | `/users/{id}`                      | 👑     | Actualizar usuario       |
| PATCH  | `/users/{id}/status`               | 👑     | Activar / bloquear       |
| PATCH  | `/users/{id}/role`                 | 👑     | Cambiar rol              |

---

## Settings

| Método | Endpoint                           | Acceso | Descripción              |
|--------|------------------------------------|--------|--------------------------|
| GET    | `/settings`                        | 🌐     | Configuración pública    |
| GET    | `/settings/admin`                  | 👑     | Configuración completa   |
| PUT    | `/settings`                        | 👑     | Actualizar configuración |

---

## Control Center ✅ Fase 3 — Solo SUPER_ADMIN

| Método | Endpoint                                        | Acceso | Descripción                              |
|--------|-------------------------------------------------|--------|------------------------------------------|
| GET    | `/control-center/audit-logs`                    | ⚡     | Historial global paginado con filtros    |
| GET    | `/control-center/audit-logs/{id}`               | ⚡     | Detalle de log con snapshots asociados   |
| GET    | `/control-center/snapshots`                     | ⚡     | Snapshots con filtros                    |
| GET    | `/control-center/snapshots/{id}`                | ⚡     | Detalle de snapshot con before/afterData |
| GET    | `/control-center/deleted-items`                 | ⚡     | Entidades con soft delete activo         |
| GET    | `/control-center/restore-actions`               | ⚡     | Historial de restauraciones              |
| POST   | `/control-center/restore/{snapshotId}`          | ⚡     | Restaurar entidad desde snapshot         |
| GET    | `/control-center/security/activity`             | ⚡     | Actividad de seguridad (USER events)     |

**Query params para GET /control-center/audit-logs:**
```
?action=CREATE|UPDATE|DELETE|SOFT_DELETE|RESTORE|STATUS_CHANGE|ROLE_CHANGE|...
&entityType=USER|PRODUCT|CATEGORY|SYSTEM|...
&entityId={uuid}
&actorUserId={uuid}
&from=2026-01-01T00:00:00Z
&to=2026-12-31T23:59:59Z
&page=0&size=20
```

**POST /control-center/restore/{snapshotId} — Request:**
```json
{ "reason": "Producto eliminado por error — restaurar para revisión" }
```

**Reglas de restauración:**
- Solo PRODUCT y CATEGORY soportados en Fase 3. USER → Fase 4.
- Producto restaurado: status=DRAFT, visible=false (admin debe revisar y activar).
- Categoría restaurada: active=false (admin debe activar manualmente).
- Si la categoría original del producto fue eliminada → 409 Conflict, restaurar primero la categoría.
- Slug de categoría en conflicto → se genera variante única automáticamente.
- Se crea RestoreAction + AuditLog RESTORE + EntitySnapshot AFTER_RESTORE por cada restauración.

---

## Códigos de respuesta

| Código | Significado                       |
|--------|-----------------------------------|
| 200    | OK                                |
| 201    | Created                           |
| 204    | No Content (delete)               |
| 400    | Bad Request / Validation Error    |
| 401    | Unauthorized (sin token)          |
| 403    | Forbidden (rol insuficiente)      |
| 404    | Not Found                         |
| 409    | Conflict (slug duplicado, etc.)   |
| 422    | Unprocessable Entity              |
| 429    | Too Many Requests (rate limit)    |
| 500    | Internal Server Error             |

## Autenticación

El access token se envía en el header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Ver [security.md](security.md) para la estrategia completa de tokens.
