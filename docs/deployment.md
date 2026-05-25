# StepUp — Guía de Deploy en Railway

> Última actualización: Fase 7 · Stack: Java 25 / Spring Boot 4.0.6 / Next.js 15

---

## Arquitectura en producción

```
Railway Project: stepup
├── Service: stepup-backend   (Java 25 + Spring Boot 4.0.6, Docker)
├── Service: stepup-frontend  (Next.js 15, Docker standalone)
└── Database: PostgreSQL      (Railway plugin — gestionado)
```

Cada servicio usa su Dockerfile dentro de su subdirectorio (`backend/` o `frontend/`). No se necesita docker-compose en Railway.

---

## 1. Pre-requisitos

- Cuenta en [railway.app](https://railway.app)
- Repositorio en GitHub (recomendado para deploy automático)
- Docker instalado localmente para probar builds antes del deploy

---

## 2. Crear el proyecto Railway

1. Ir a [railway.app/new](https://railway.app/new)
2. Crear nuevo proyecto → **"Empty Project"**
3. Nombre: `stepup`

---

## 3. Crear la base de datos PostgreSQL

1. En el proyecto, click **"+ New Service"** → **"Database"** → **"PostgreSQL"**
2. Railway provisiona PostgreSQL automáticamente
3. Railway expone automáticamente las variables: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

> **Importante:** Railway expone `DATABASE_URL` en formato `postgresql://user:pass@host:port/db`.
> El driver JDBC de Spring Boot necesita `jdbc:postgresql://...` — son formatos distintos y el driver rechaza el formato sin prefijo `jdbc:`.
> Por eso el backend construye la URL directamente desde `PGHOST`/`PGPORT`/`PGDATABASE` que Railway también provee automáticamente.

---

## 4. Crear el servicio backend

### 4a. Conectar repositorio

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Seleccionar el repositorio StepUp
3. En **Settings → Source**:
   - **Root Directory:** `backend`
   - **Branch:** `main`
4. Railway detectará el `Dockerfile` y usará el `railway.toml` automáticamente

### 4b. Variables de entorno del backend

En **Settings → Variables**, agregar:

| Variable | Valor | Descripción |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` | Activa perfil de producción |
| `PGHOST` | `${{Postgres.PGHOST}}` | Host de la DB (del plugin PostgreSQL) |
| `PGPORT` | `${{Postgres.PGPORT}}` | Puerto de la DB |
| `PGDATABASE` | `${{Postgres.PGDATABASE}}` | Nombre de la DB |
| `PGUSER` | `${{Postgres.PGUSER}}` | Usuario de la DB |
| `PGPASSWORD` | `${{Postgres.PGPASSWORD}}` | Contraseña de la DB |
| `JWT_SECRET` | *(ver abajo)* | Secreto seguro de 64+ caracteres |
| `JWT_ACCESS_EXPIRATION_MINUTES` | `15` | Expiración access token (minutos) |
| `JWT_REFRESH_EXPIRATION_DAYS` | `7` | Expiración refresh token (días) |
| `ALLOWED_ORIGINS` | `https://<tu-frontend>.up.railway.app` | URL del frontend (actualizar después) |
| `SUPER_ADMIN_EMAIL` | `admin@tudominio.com` | Email del primer admin |
| `SUPER_ADMIN_PASSWORD` | *(contraseña muy segura)* | Cambiar después del primer login |
| `SUPER_ADMIN_FULL_NAME` | `Admin` | Nombre del admin inicial |
| `HIBERNATE_DDL_AUTO` | `validate` | Validación de esquema Hibernate (`none` solo para diagnóstico) |

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# o:
openssl rand -hex 64
```

> La sintaxis `${{PostgreSQL.PGHOST}}` es la referencia de variables de Railway entre servicios del mismo proyecto.

### 4c. Health check

El `railway.toml` ya configura:
- `healthcheckPath = "/api/v1/health"`
- `healthcheckTimeout = 300`

Railway esperará que el endpoint responda 200 antes de considerar el deploy exitoso.

---

## 5. Crear el servicio frontend

### 5a. Conectar repositorio

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Seleccionar el mismo repositorio
3. En **Settings → Source**:
   - **Root Directory:** `frontend`
   - **Branch:** `main`

### 5b. Variables de entorno del frontend

| Variable | Valor | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://<backend>.up.railway.app/api/v1` | URL del backend (obtener después del primer deploy) |
| `NEXT_PUBLIC_APP_NAME` | `StepUp` | Nombre de la tienda |
| `NEXT_PUBLIC_WA_NUMBER` | *(opcional)* | Fallback de WhatsApp (también configurable en /admin/configuracion) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | *(Cloudinary cloud name)* | Cloud público — habilita subida real de imágenes en el panel admin |
| `CLOUDINARY_API_KEY` | *(Cloudinary key)* | Solo servidor — usada por /api/cloudinary/sign y /api/cloudinary/delete |
| `CLOUDINARY_API_SECRET` | *(Cloudinary secret)* | **SOLO servidor**. Nunca prefijar con `NEXT_PUBLIC_`. |
| `CLOUDINARY_UPLOAD_FOLDER` | `stepup/products` | Folder Cloudinary donde se guardan las imágenes (opcional). También limita qué assets se pueden borrar desde /api/cloudinary/delete. |
| `NODE_ENV` | `production` | Modo producción |

> **IMPORTANTE:** `NEXT_PUBLIC_*` se inyectan en **build time**. Si los cambias, debes hacer redeploy del frontend.
> Las variables Cloudinary se configuran solo en el servicio **FrontEnd** (no en backend).
> Cuando el admin elimina una imagen subida (con `cloudinaryPublicId`), `/api/cloudinary/delete` borra el asset real en Cloudinary tras confirmación. URLs manuales no se borran del proveedor.

---

## 6. Orden de deploy recomendado

```
1. Deploy PostgreSQL (automático al crearlo)
2. Deploy backend
3. Verificar /api/v1/health → 200
4. Obtener URL del backend
5. Configurar NEXT_PUBLIC_API_BASE_URL en frontend con esa URL
6. Deploy frontend
7. Obtener URL del frontend
8. Actualizar ALLOWED_ORIGINS en backend con esa URL
9. Redeploy backend (solo cambia una variable, Railway hace redeploy automático)
```

---

## 7. Variables de entorno — Resumen completo

### Backend

```bash
SPRING_PROFILES_ACTIVE=prod
PORT=                          # Railway lo inyecta automáticamente — NO configurar

# Variables del plugin PostgreSQL (Railway las vincula con ${{Postgres.PGxxx}})
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}

# Alternativa (opcional): URL JDBC completa manual
# DATABASE_URL_JDBC=jdbc:postgresql://host:port/database
# DATABASE_USERNAME=user
# DATABASE_PASSWORD=password

JWT_SECRET=<64+ caracteres hex aleatorios>
JWT_ACCESS_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_DAYS=7

ALLOWED_ORIGINS=https://<frontend>.up.railway.app

SUPER_ADMIN_EMAIL=admin@tudominio.com
SUPER_ADMIN_PASSWORD=<contraseña muy segura>
SUPER_ADMIN_FULL_NAME=Admin

HIBERNATE_DDL_AUTO=validate          # none solo para diagnóstico temporal
```

### Frontend

```bash
NEXT_PUBLIC_API_BASE_URL=https://<backend>.up.railway.app/api/v1
NEXT_PUBLIC_APP_NAME=StepUp
NEXT_PUBLIC_WA_NUMBER=          # opcional, también configurable en /admin/configuracion

# Cloudinary (subida real de imágenes desde el panel admin)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>            # servidor — no exponer
CLOUDINARY_API_SECRET=<api_secret>      # servidor — NUNCA con prefijo NEXT_PUBLIC_
CLOUDINARY_UPLOAD_FOLDER=stepup/products

NODE_ENV=production
```

---

## 8. Comportamientos automáticos en el primer deploy

- **Flyway** ejecuta automáticamente V1..V13 sobre la base de datos limpia
- **SuperAdminSeeder** crea el SUPER_ADMIN con las credenciales configuradas (solo si no existe ninguno)
- **StoreSettings** tiene valores por defecto insertados en V12 (storeName, heroTitle, etc.)

---

## 9. Prueba local del build de producción

### Backend (sin Docker)

```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/stepup-backend-*.jar --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:postgresql://localhost:5432/stepup_dev \
  --spring.datasource.username=stepup \
  --spring.datasource.password=changeme
```

### Frontend (sin Docker)

```bash
cd frontend
npm ci
npm run build
npm run start
# abre http://localhost:3000
```

### Build Docker local

```bash
# Backend
docker build -t stepup-backend ./backend

# Frontend
docker build -t stepup-frontend ./frontend

# Ejecutar backend local con Docker
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=stepup_dev \
  -e DB_USER=stepup \
  -e DB_PASSWORD=changeme \
  -e JWT_SECRET=dev-secret-change-this-in-production-must-be-at-least-64-chars-long \
  stepup-backend
```

---

## 10. Flyway en producción

- Flyway está habilitado en todos los perfiles (`spring.flyway.enabled=true`)
- Spring Boot garantiza que Flyway corra **antes** de que Hibernate valide el esquema
- En producción, `spring.jpa.hibernate.ddl-auto=validate` — Hibernate solo verifica, nunca crea ni modifica
- Las 13 migraciones (V1..V13) se aplican en orden en el primer deploy a una DB vacía
- **No borrar migraciones aplicadas** — rompe el historial en bases existentes

### Logs esperados al iniciar en Railway

En los logs del servicio backend (Railway → Logs), buscar líneas como:

**Primera vez (DB vacía):**
```
Flyway Community Edition ... by Redgate
Database: jdbc:postgresql://... (PostgreSQL ...)
Successfully validated 13 migrations (execution time ...)
Current version of schema "public": << Empty Schema >>
Migrating schema "public" to version 1 - create users
...
Migrating schema "public" to version 13 - create analytics events
Successfully applied 13 migrations to schema "public" (...)
```

**Deploys posteriores (migraciones ya aplicadas):**
```
Flyway Community Edition ... by Redgate
Database: jdbc:postgresql://... (PostgreSQL ...)
Successfully validated 13 migrations (execution time ...)
Schema "public" is up to date. No migration necessary.
```

Si ves solo `Successfully validated X migrations` sin `Migrating schema`, las migraciones ya estaban aplicadas — es correcto.

### Por qué Flyway no aparecía en logs — Spring Boot 4 (causa raíz resuelta)

**Spring Boot 4.0 eliminó `FlywayAutoConfiguration` de `spring-boot-autoconfigure`.**
En versiones anteriores (3.x), Spring Boot auto-configuraba Flyway y garantizaba que corriera antes de Hibernate. En Spring Boot 4.0.6, esa auto-configuración fue eliminada — `FlywayAutoConfiguration` simplemente no existe en el JAR.

**Solución implementada:** `com.stepup.config.FlywayConfig` configura Flyway manualmente:
- Crea el bean `Flyway` con el `DataSource` inyectado
- Llama `flyway.migrate()` durante la inicialización del bean
- Registra `EntityManagerFactoryDependsOnPostProcessor("flyway")` que hace que Hibernate siempre espere a que Flyway termine

Esta configuración es definitiva. No es necesario usar `HIBERNATE_DDL_AUTO=none` como diagnóstico.

### Diagnóstico: si Flyway aún no aparece en logs

Si después de esta corrección Hibernate sigue fallando con `missing table` y NO se ven logs de Flyway:

1. **`SPRING_PROFILES_ACTIVE=prod`** debe estar configurada en Railway → Variables.

2. **Las migraciones están empaquetadas en el JAR.** Verificar antes del deploy:
   ```bash
   jar tf target/stepup-backend-*.jar | grep db/migration
   # Debe listar: BOOT-INF/classes/db/migration/V1__...sql ... V13__...sql
   ```

3. **La base de datos es accesible.** Verificar que `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` apuntan al plugin PostgreSQL correcto.

4. **Verificar dependencias Flyway en pom.xml:** Spring Boot 4 requiere AMBAS:
   - `org.flywaydb:flyway-core`
   - `org.flywaydb:flyway-database-postgresql` (módulo específico para PostgreSQL en Flyway 10+)

5. **Si la DB tiene tablas sin historial Flyway** (deploy previo sin Flyway): usar `FLYWAY_BASELINE_ON_MIGRATE=true` **una sola vez** para registrar el estado actual como baseline. Luego volver a `false`.

### Variables de entorno para diagnóstico

| Variable | Normal | Diagnóstico |
|---|---|---|
| `HIBERNATE_DDL_AUTO` | `validate` | `none` (temporal) |
| `FLYWAY_BASELINE_ON_MIGRATE` | `false` | `true` (solo si DB ya tiene tablas sin historial Flyway) |

### `FLYWAY_BASELINE_ON_MIGRATE`

| Valor | Cuándo usar |
|---|---|
| `false` (default) | Base de datos nueva o con historial Flyway correcto |
| `true` | Base ya tiene tablas creadas sin Flyway — se hace baseline del estado actual |

> **No usar `true` a ciegas** — puede hacer que Flyway salte migraciones y deje el esquema incompleto.

---

## 11. CORS en producción

El backend limita las peticiones a `ALLOWED_ORIGINS`. Configurar la URL exacta del frontend:

```
ALLOWED_ORIGINS=https://stepup-frontend.up.railway.app
```

Si usas dominio personalizado:
```
ALLOWED_ORIGINS=https://www.tutienda.com,https://tutienda.com
```

> No usar `*` en producción — los endpoints usan `Authorization: Bearer` que requiere CORS explícito.

---

## 12. Checklist de verificación post-deploy

Ver [docs/deployment-checklist.md](deployment-checklist.md)

---

## 13. Dominios personalizados

En Railway, cada servicio puede tener un dominio personalizado:

1. **Settings → Networking → Custom Domain**
2. Agregar el dominio
3. Configurar el registro CNAME en tu DNS apuntando a Railway
4. Railway provee HTTPS automáticamente

---

## 14. Logs y monitoreo

```bash
# Con Railway CLI
railway logs --service stepup-backend
railway logs --service stepup-frontend

# O desde el dashboard: Service → Logs
```

---

## 15. Troubleshooting común

### Backend no arranca — error de conexión a DB

**Causa frecuente:** `DATABASE_URL` de Railway tiene formato `postgresql://` pero el driver JDBC necesita `jdbc:postgresql://`.
**Solución:** No usar `DATABASE_URL` directamente. Configurar las variables `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` referenciando el plugin PostgreSQL:
```
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
```
El backend construye `jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}` automáticamente.

Si prefieres usar una URL completa, usa `DATABASE_URL_JDBC=jdbc:postgresql://host:port/db` (no `DATABASE_URL`).

- Verificar que el plugin PostgreSQL está activo y linkado al mismo proyecto
- En Railway, las referencias `${{Postgres.PGHOST}}` solo funcionan cuando los servicios están en el mismo proyecto Railway

### Frontend no se conecta al backend (CORS error)

- Verificar `ALLOWED_ORIGINS` en backend incluye la URL exacta del frontend (con `https://`)
- Verificar `NEXT_PUBLIC_API_BASE_URL` en frontend apunta al backend correcto
- Hacer redeploy del frontend si se cambió `NEXT_PUBLIC_API_BASE_URL`

### Flyway falla al arrancar

- Verificar que la base de datos está accesible
- En un deploy fresco, Flyway ejecuta V1..V13; no debe haber errores si la DB está vacía
- Si hay error de checksum, alguna migración fue editada después de aplicarse — NO editar migraciones aplicadas

### SUPER_ADMIN no fue creado

- Verificar que `SUPER_ADMIN_EMAIL` y `SUPER_ADMIN_PASSWORD` están configuradas
- Revisar logs del backend al arrancar: debe mostrar "SUPER_ADMIN created successfully"
- Si ya existe un SUPER_ADMIN, el seeder no crea otro (comportamiento correcto)

### Login del SUPER_ADMIN responde 401 en producción

El usuario SUPER_ADMIN fue creado con una contraseña distinta a la que está en `SUPER_ADMIN_PASSWORD` (por ejemplo, fue creado en un deploy previo con otro valor). El seeder **nunca actualiza** la contraseña si el usuario ya existe.

**Solución — reset controlado con variable de entorno:**

> `SUPER_ADMIN_PASSWORD` solo se usa en la **creación inicial**. Para resetear la contraseña de un SUPER_ADMIN ya existente, usar el procedimiento siguiente.

1. En Railway → Variables del servicio backend, configurar:
   ```
   SUPER_ADMIN_RESET_PASSWORD=true
   SUPER_ADMIN_EMAIL=<email exacto del SUPER_ADMIN>
   SUPER_ADMIN_PASSWORD=<nueva contraseña segura>
   ```
2. Hacer redeploy del backend (Railway → Deploy → Redeploy).
3. En los logs del backend buscar:
   ```
   SUPER_ADMIN password reset completed for email: <email>
   ```
4. Probar el login con las nuevas credenciales.
5. Una vez confirmado el acceso, volver a poner `SUPER_ADMIN_RESET_PASSWORD=false` en Railway → Variables.
6. Hacer redeploy del backend nuevamente para desactivar el reset.

> **Importante:** Volver a `false` después del reset. Si se deja en `true`, cada reinicio del backend sobreescribe la contraseña con el valor de `SUPER_ADMIN_PASSWORD`.

**Validaciones del reset:**
- Si no hay usuario activo (no soft-deleted) con ese email → el reset se omite con `WARN`.
- Si el usuario existe pero no tiene rol `SUPER_ADMIN` → el reset se omite con `WARN`.
- Si el usuario está `INACTIVE` o `BLOCKED` → se reactiva automáticamente.
- La contraseña nunca aparece en los logs.

### Frontend muestra "localhost" en API calls

- `NEXT_PUBLIC_API_BASE_URL` no está configurada o apunta a localhost
- Las variables `NEXT_PUBLIC_*` se inyectan en build time — **redeploy necesario** después de cambiarlas
