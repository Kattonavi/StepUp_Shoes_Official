# StepUp — Checklist de Deploy en Railway

Marcar cada ítem después de verificar. Completar en orden.

---

## Pre-deploy

- [ ] Repositorio en GitHub (o GitLab)
- [ ] Todos los tests pasan: `mvnw test` y `npm run build`
- [ ] No hay secretos en el repositorio (`.env` en `.gitignore` ✓)
- [ ] `JWT_SECRET` generado con 64+ caracteres aleatorios
- [ ] `SUPER_ADMIN_PASSWORD` es una contraseña segura (no "changeme")
- [ ] `ALLOWED_ORIGINS` lista de URLs correctas del frontend

---

## PostgreSQL

- [ ] Plugin PostgreSQL creado en Railway
- [ ] Railway expone `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- [ ] Conexión verificada (Railway muestra "Connected" en el plugin)

---

## Backend — Deploy

- [ ] Servicio backend creado, Root Directory = `backend`
- [ ] `SPRING_PROFILES_ACTIVE=prod` configurada
- [ ] `DATABASE_URL=jdbc:postgresql://${{PostgreSQL.PGHOST}}:${{PostgreSQL.PGPORT}}/${{PostgreSQL.PGDATABASE}}` configurada
- [ ] `DATABASE_USERNAME=${{PostgreSQL.PGUSER}}` configurada
- [ ] `DATABASE_PASSWORD=${{PostgreSQL.PGPASSWORD}}` configurada
- [ ] `JWT_SECRET` configurada (64+ chars)
- [ ] `ALLOWED_ORIGINS` configurada (actualizar después de obtener URL frontend)
- [ ] `SUPER_ADMIN_EMAIL` configurada
- [ ] `SUPER_ADMIN_PASSWORD` configurada
- [ ] `SUPER_ADMIN_FULL_NAME` configurada
- [ ] Deploy exitoso (Railway muestra "Deployed")

---

## Backend — Verificación

- [ ] `GET /api/v1/health` → `200 OK` con `{"status":"UP",...}`
- [ ] Logs muestran "Flyway migration applied V1..V13" (o similar)
- [ ] Logs muestran "SUPER_ADMIN created successfully" (primer deploy)
- [ ] Logs NO muestran contraseñas ni JWT secrets
- [ ] `POST /api/v1/auth/login` con credenciales SUPER_ADMIN → `200` con tokens
- [ ] `GET /api/v1/settings` → `200` con storeName "StepUp"
- [ ] `GET /api/v1/products` → `200`
- [ ] `GET /api/v1/categories` → `200`

---

## Frontend — Deploy

- [ ] Servicio frontend creado, Root Directory = `frontend`
- [ ] `NEXT_PUBLIC_API_BASE_URL=https://<backend-domain>/api/v1` configurada
- [ ] `NODE_ENV=production` configurada
- [ ] Deploy exitoso

---

## Frontend — Verificación

- [ ] Home pública carga (`/`)
- [ ] Catálogo carga (`/catalogo`)
- [ ] Detalle de producto carga (`/producto/<slug>`)
- [ ] Formulario de contacto carga y envía (`/contacto`)
- [ ] Login carga y funciona (`/login`)
- [ ] Admin dashboard carga después de login (`/admin`)
- [ ] Admin mensajes carga (`/admin/mensajes`)
- [ ] Admin configuración carga (`/admin/configuracion`)
- [ ] Analytics carga (`/admin/analytics`)
- [ ] Control Center carga solo para SUPER_ADMIN (`/admin/control-center`)
- [ ] Usuarios con otros roles NO acceden a Control Center

---

## CORS

- [ ] Desde el frontend en producción, las llamadas al backend no tienen errores CORS
- [ ] `ALLOWED_ORIGINS` en backend incluye la URL exacta del frontend
- [ ] Si se cambió `ALLOWED_ORIGINS` → backend hizo redeploy automático

---

## Seguridad

- [ ] `OWNER` NO puede acceder a `/admin/control-center` (redirige a `/admin`)
- [ ] Usuario sin login redirige a `/login` desde `/admin`
- [ ] JWT expirado → refresco automático funciona
- [ ] `.env` NO está en el repositorio (verificar GitHub)
- [ ] Swagger UI deshabilitado (`/swagger-ui` → 404 o error)
- [ ] CORS no está en `*` (verificar en DevTools → Network → OPTIONS)

---

## Base de datos (via Control Center)

- [ ] Tabla `users` tiene fila SUPER_ADMIN
- [ ] Tabla `store_settings` tiene fila `singleton_key = 'GLOBAL'`
- [ ] Todas las migraciones V1..V13 están en `flyway_schema_history`
- [ ] No hay datos demo inseguros de desarrollo

---

## Post-deploy inmediato

- [ ] **Cambiar contraseña SUPER_ADMIN** después del primer login
  - Settings futura o crear OWNER con nueva contraseña y desactivar SUPER_ADMIN de dev
- [ ] Configurar `storeName`, `whatsappNumber`, logo, SEO en `/admin/configuracion`
- [ ] Verificar que analytics events se registran (abrir catálogo, ver consola Network)

---

## Checklist de producción continua

- [ ] Railway alertas configuradas (Settings → Observability)
- [ ] Dominio personalizado configurado si aplica
- [ ] Backup automático de PostgreSQL en Railway configurado (Railway Volumes o external dump)
- [ ] Variables sensibles rotadas periódicamente

---

## Qué queda fuera del deploy actual

- [ ] SMTP para emails de notificación
- [ ] Upload real de imágenes (actualmente solo URLs)
- [ ] CDN para assets estáticos
- [ ] CI/CD completo con GitHub Actions
- [ ] Monitoring/alerting externo (Sentry, Datadog, etc.)
