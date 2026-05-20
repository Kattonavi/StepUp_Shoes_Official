# Roadmap de desarrollo — StepUp

## Visión

Construir StepUp de forma incremental, asegurando que cada fase entregue valor y que la base sea sólida antes de avanzar.

---

## Fase 0 — Base profesional ✅

**Objetivo:** Monorepo funcional con estructura sólida.

### Entregables
- [x] Monorepo base (frontend/ + backend/ + docs/ + infra/)
- [x] Documentación estratégica completa (12 documentos)
- [x] Frontend: Next.js 15 con Tailwind, estructura de carpetas, páginas placeholder
- [x] Backend: Spring Boot 4.0.6 + Java 25, endpoints `/health` y `/public/info` funcionales
- [x] Dockerfiles para frontend y backend
- [x] docker-compose.yml para PostgreSQL local
- [x] Variables de entorno documentadas
- [x] .gitignore configurado
- [x] Flyway configurado con migración inicial de extensiones
- [x] SecurityConfig base (endpoints públicos permitidos)
- [x] Controladores placeholder marcados con TODOs por fase

### Verificación
```bash
# Backend compila y arranca
cd backend && .\mvnw.cmd clean compile && .\mvnw.cmd spring-boot:run

# Frontend instala y arranca
cd frontend && npm install && npm run dev

# DB local
docker compose -f infra/docker-compose.yml up -d

# Endpoints
GET http://localhost:8080/api/v1/health
GET http://localhost:8080/api/v1/public/info
```

---

## Fase 1 — Autenticación y Usuarios ✅

**Objetivo:** Sistema de auth completo con JWT y gestión de usuarios.

### Entregables
- [x] Entidad `User` con JPA, roles, soft delete
- [x] Tabla `users` en Flyway (V2__create_users.sql)
- [x] Tabla `refresh_tokens` en Flyway (V3__create_refresh_tokens.sql)
- [x] `UserDetailsServiceImpl` para Spring Security
- [x] `JwtService` (generate, validate, extract)
- [x] `JwtAuthenticationFilter` en la cadena de seguridad
- [x] `POST /auth/login` funcional
- [x] `POST /auth/refresh` funcional
- [x] `POST /auth/logout` funcional
- [x] `GET /auth/me` funcional
- [x] CRUD de usuarios (GET, POST, PUT, PATCH /status, PATCH /role)
- [x] Seed seguro de SUPER_ADMIN al iniciar
- [x] Protección de SUPER_ADMIN en todos los endpoints
- [x] Tests unitarios: JwtServiceTest, RoleHierarchyTest, HashUtilsTest

### Dependencias previas
- Fase 0 completada

---

## Fase 2 — Productos y Categorías ✅ Actual

**Objetivo:** CRUD completo de catálogo con imágenes, tallas e inventario básico.

### Entregables
- [x] Entidades JPA: `Category`, `Product`, `ProductImage`, `ProductSize`
- [x] Enums: `ProductStatus` (ACTIVE/DRAFT/HIDDEN/DELETED), `StockStatus` (AVAILABLE/OUT_OF_STOCK/ON_REQUEST)
- [x] Migraciones Flyway: V4__create_categories, V5__create_products, V6__create_product_images, V7__create_product_sizes
- [x] `SlugService`: slugify con normalización unicode, generación automática de slugs únicos (zapatos → zapatos-2 → zapatos-3)
- [x] CRUD completo de categorías con soft delete (Estrategia A: impide eliminar si tiene productos activos)
- [x] CRUD completo de productos con soft delete
- [x] Gestión de imágenes (URL-only, upload real en fase futura)
- [x] Gestión de tallas e inventario básico por talla
- [x] Filtros de catálogo público: categorySlug, search, minPrice, maxPrice, stockStatus, isNew, isOnSale, isFeatured
- [x] Ordenamiento: newest, price_asc, price_desc, name_asc, featured
- [x] Paginación en todos los listados
- [x] DTOs limpios (records), mappers manuales (decision: sin MapStruct para garantizar compatibilidad Java 25)
- [x] Endpoints públicos protegidos por visibilidad/status en capa de servicio
- [x] Endpoints admin protegidos con `@PreAuthorize` por rol
- [x] EDITOR puede crear/editar productos (documentado)
- [x] Restore básico de categorías y productos (sin auditoría, queda para Fase 3)
- [x] Tests unitarios: SlugServiceTest (11 tests), CategoryServiceTest (8 tests), ProductRulesTest (8 tests)
- [x] 82 tests totales pasando (incluye Fase 1)

### Decisiones técnicas de esta fase
- **Soft delete categorías**: Estrategia A — impedir eliminar si tiene productos no-eliminados activos. Requiere que admin elimine/reasigne productos primero. Seguro y explícito.
- **Soft delete productos**: status=DELETED + visible=false + deletedAt=now + deletedBy=userId.
- **Restore**: deja entidad como DRAFT/inactive y visible=false por seguridad. Auditoría real en Fase 3.
- **EDITOR**: puede crear y editar productos (no eliminar). Documentado en SecurityConfig y controllers.
- **MapStruct**: configurado en pom.xml pero no usado en esta fase. Se usa mapeo manual para garantizar compatibilidad con Java 25 y control total.

### Dependencias previas
- Fase 1 completada

---

## Fase 3 — Auditoría y Control Center (backend) ✅ Actual

**Objetivo:** Sistema de auditoría completo y restauración tipo Ctrl+Z exclusivo para SUPER_ADMIN.

### Entregables
- [x] Enums: `AuditAction` (15 valores), `AuditableEntityType` (8 tipos), `SnapshotReason` (6 razones)
- [x] Entidades JPA: `AuditLog`, `EntitySnapshot`, `RestoreAction`
- [x] Migraciones Flyway: V8__create_audit_logs, V9__create_entity_snapshots, V10__create_restore_actions
- [x] JSONB para beforeData/afterData usando `@JdbcTypeCode(SqlTypes.JSON)`
- [x] `EntitySerializationService`: serialización segura sin passwordHash ni secretos
- [x] `AuditLogService`: creación de logs + snapshots automáticos en la misma transacción
- [x] `EntitySnapshotService`: consulta y filtrado de snapshots
- [x] `RestoreService`: restauración real desde snapshot para PRODUCT y CATEGORY
- [x] `ControlCenterService`: orquestación de todas las queries del Control Center
- [x] `ControlCenterController`: 7 endpoints implementados, todos @PreAuthorize SUPER_ADMIN
- [x] Integración audit en `ProductService`: CREATE, UPDATE, SOFT_DELETE, RESTORE, VISIBILITY_CHANGE, STOCK_CHANGE, STATUS_CHANGE
- [x] Integración audit en `CategoryService`: CREATE, UPDATE, SOFT_DELETE, RESTORE, STATUS_CHANGE
- [x] Integración audit en `UserService`: CREATE, UPDATE, STATUS_CHANGE, ROLE_CHANGE
- [x] 5 nuevas excepciones de dominio + handlers en GlobalExceptionHandler
- [x] Tests: EntitySerializationServiceTest (6), AuditLogServiceTest (4), RestoreServiceTest (5), ControlCenterPermissionTest (5)
- [x] 106 tests totales pasando

### Decisiones técnicas de esta fase
- **Auditoría explícita en servicios** (no AOP): más predecible, sin riesgo de Java 25/AOP incompatibilidades
- **Única transacción**: AuditLog + EntitySnapshot se guardan junto con la operación principal. Si falla el audit, falla la operación (consistencia fuerte)
- **JSONB con `@JdbcTypeCode(SqlTypes.JSON)`**: compatible con Hibernate 6+ / 7, soportado por PostgreSQL JDBC driver
- **Actor denormalizado**: `actor_email` y `actor_role` se guardan en la fila de audit_log → eliminar un usuario no rompe el historial
- **Restore seguro**: productos restaurados siempre llegan como DRAFT + visible=false independientemente del snapshot. Admin debe revisarlos manualmente
- **Restauración de USER**: no implementada (complejidad de seguridad). Se audita pero no se restaura via snapshot en esta fase
- **`getDeletedItems`**: pagina sobre productos y categorías con `deletedAt IS NOT NULL`
- **Slug en restore de categoría**: si hay conflicto, genera variante única automáticamente (zapatos → zapatos-2)

### Dependencias previas
- Fase 2 completada

---

## Fase 4 — Frontend público completo

**Objetivo:** Catálogo público funcional conectado al backend real.

### Entregables
- [ ] Home: productos destacados, nuevos, en rebaja desde API
- [ ] Catálogo `/catalogo`: grid con filtros, búsqueda, paginación
- [ ] Filtros: categoría, precio, disponibilidad, etiquetas
- [ ] Detalle de producto `/producto/[slug]`
- [ ] Botón WhatsApp con mensaje predefinido
- [ ] SEO por producto (metadata de Next.js)
- [ ] Componentes: ProductCard, ProductGrid, ProductDetail
- [ ] Hooks: useProducts, useCategories
- [ ] Páginas 404 y error reales
- [ ] Analíticas: registrar PRODUCT_VIEW y WHATSAPP_CLICK
- [ ] Tests de componentes clave

### Dependencias previas
- Fase 2 completada

---

## Fase 5 — Frontend admin completo

**Objetivo:** Panel administrativo funcional.

### Entregables
- [ ] Layout admin con sidebar y navegación
- [ ] Dashboard con métricas básicas
- [ ] CRUD de productos en UI
- [ ] CRUD de categorías en UI
- [ ] Gestión de imágenes en UI
- [ ] Gestión de tallas en UI
- [ ] Gestión de usuarios en UI (solo para OWNER+)
- [ ] Cambio de roles
- [ ] UI de Control Center para SUPER_ADMIN
  - [ ] Historial de cambios
  - [ ] Elementos eliminados con botón de restaurar
  - [ ] Comparación before/after
- [ ] Protección de rutas por rol en el frontend

### Dependencias previas
- Fase 1, 2, 3 completadas

---

## Fase 6 — Mensajes, Analíticas y Configuración

**Objetivo:** Módulos complementarios del sistema.

### Entregables
- [ ] Tabla messages (V8__messages.sql)
- [ ] Tabla analytics_events (V9__analytics_events.sql)
- [ ] Tabla store_settings (V10__store_settings.sql)
- [ ] Tabla admin_activity (V11__admin_activity.sql)
- [ ] Formulario de contacto público
- [ ] Panel de mensajes en admin
- [ ] Dashboard de analíticas con Recharts
- [ ] Registro de eventos de analítica (PRODUCT_VIEW, WHATSAPP_CLICK, etc.)
- [ ] Configuración de tienda funcional
- [ ] Seed de store_settings inicial

### Dependencias previas
- Fase 2 completada

---

## Fase 7 — Deploy en Railway

**Objetivo:** Sistema desplegado y accesible en producción.

### Entregables
- [ ] Proyecto Railway creado
- [ ] Servicio PostgreSQL en Railway
- [ ] Backend desplegado en Railway con perfil prod
- [ ] Frontend desplegado en Railway
- [ ] Variables de entorno configuradas en Railway
- [ ] Dominio personalizado (si aplica)
- [ ] SUPER_ADMIN seed ejecutado en producción
- [ ] Verificación de endpoints en producción
- [ ] Logs revisados y servicio estable

### Dependencias previas
- Fase 4 o 5 completadas (mínimo funcional para prod)

---

## Fase 8 — Testing, Seguridad y Optimización

**Objetivo:** Calidad, seguridad y rendimiento de producción.

### Entregables
- [ ] Cobertura de tests: mínimo 70% en servicios
- [ ] Tests de integración con Testcontainers
- [ ] Rate limiting (Bucket4j o similar)
- [ ] Auditoría de seguridad (OWASP Top 10)
- [ ] Optimización de consultas PostgreSQL (EXPLAIN ANALYZE)
- [ ] Índices adicionales si se necesitan
- [ ] Configuración de caché (Spring Cache + Redis o en memoria)
- [ ] CI/CD con GitHub Actions
- [ ] Lighthouse audit del frontend (performance, SEO, accesibilidad)
- [ ] Optimización de imágenes (Next.js Image component)
- [ ] Purga automática de analytics_events antiguos

---

## Estimación de esfuerzo

| Fase | Dificultad | Estimación aproximada |
|------|------------|----------------------|
| 0    | Baja       | Completada           |
| 1    | Media-Alta | 3-5 días             |
| 2    | Media-Alta | 4-6 días             |
| 3    | Alta       | 4-7 días             |
| 4    | Media      | 3-5 días             |
| 5    | Media-Alta | 5-8 días             |
| 6    | Media      | 3-4 días             |
| 7    | Baja       | 1-2 días             |
| 8    | Media-Alta | 3-6 días             |

*Estimaciones para desarrollo individual, a tiempo parcial.*
