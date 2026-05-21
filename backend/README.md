# StepUp Backend

API REST del proyecto StepUp, construida con Java 25 y Spring Boot 4.0.6.

## Stack

- **Java 25** — Eclipse Temurin recomendado
- **Spring Boot 4.0.6** — Spring Framework 7.x y Jakarta EE 11 (`jakarta.*` NOT `javax.*`)
- **Spring Security 7.x** — Auth stateless con JWT (JJWT 0.12.6)
- **Spring Data JPA** — Repositorios JPA con Hibernate 7.x
- **PostgreSQL 16** — Base de datos principal
- **Flyway** — Migraciones de esquema
- **Lombok** — Reducción de boilerplate
- **MapStruct** — Mapeo entidades ↔ DTOs
- **JUnit 5 + AssertJ + Testcontainers** — Tests

## Prerrequisitos

- **Java 25** instalado (`JAVA_HOME` apuntando a JDK 25)
- Maven (o usar el Maven Wrapper incluido)
- PostgreSQL corriendo en `localhost:5432` (o usar Docker)
- Variables de entorno configuradas (ver `.env.example`)

## Configuración rápida

```bash
# 1. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales

# 2. Levantar PostgreSQL con Docker (recomendado para desarrollo)
docker compose -f ../infra/docker-compose.yml up -d

# 3. Compilar
.\mvnw.cmd clean compile          # Windows
./mvnw clean compile              # Unix/Mac

# 4. Ejecutar tests unitarios (no requieren DB)
.\mvnw.cmd test -Dtest="JwtServiceTest,HashUtilsTest,RoleHierarchyTest"

# 5. Iniciar en modo dev
.\mvnw.cmd spring-boot:run
```

## Cómo funciona el SUPER_ADMIN

Al iniciar el backend, `SuperAdminSeeder` corre automáticamente:

1. Busca si existe algún usuario con rol `SUPER_ADMIN` (incluyendo eliminados).
2. Si no existe y `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASSWORD` están configurados → crea el SUPER_ADMIN.
3. Si ya existe → no hace nada.
4. Si faltan las variables → loggea un warning y no crea nada.

**Nunca crear SUPER_ADMIN desde un endpoint de la API.** Solo se crea por seed.

## Cómo probar el login

Con el backend corriendo y el SUPER_ADMIN creado:

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@stepup.local","password":"tu-password"}'

# La respuesta incluye accessToken y refreshToken
# Usar el accessToken en requests autenticadas:
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer {accessToken}"

# Refresh de token
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"tu-refresh-token"}'

# Logout
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"tu-refresh-token"}'
```

## Endpoints implementados (Fase 1)

| Método | Endpoint                         | Auth | Rol mínimo    |
|--------|----------------------------------|------|---------------|
| GET    | `/api/v1/health`                 | No   | —             |
| GET    | `/api/v1/public/info`            | No   | —             |
| POST   | `/api/v1/auth/login`             | No   | —             |
| POST   | `/api/v1/auth/refresh`           | No   | —             |
| POST   | `/api/v1/auth/logout`            | Sí   | Cualquier rol |
| GET    | `/api/v1/auth/me`                | Sí   | Cualquier rol |
| GET    | `/api/v1/users`                  | Sí   | OWNER+        |
| GET    | `/api/v1/users/{id}`             | Sí   | OWNER+        |
| POST   | `/api/v1/users`                  | Sí   | OWNER+        |
| PUT    | `/api/v1/users/{id}`             | Sí   | OWNER+        |
| PATCH  | `/api/v1/users/{id}/status`      | Sí   | OWNER+        |
| PATCH  | `/api/v1/users/{id}/role`        | Sí   | OWNER+        |

## Variables de entorno

**Desarrollo local** (perfil `dev`, archivo `.env`):

| Variable         | Descripción                            |
|------------------|----------------------------------------|
| `DB_HOST`        | Host de PostgreSQL (default: localhost)|
| `DB_PORT`        | Puerto (default: 5432)                 |
| `DB_NAME`        | Nombre de la base de datos             |
| `DB_USER`        | Usuario de PostgreSQL                  |
| `DB_PASSWORD`    | Contraseña de PostgreSQL               |

**Producción Railway** (perfil `prod`, variables del servicio):

| Variable                        | Descripción                                      | Requerida |
|---------------------------------|--------------------------------------------------|:---------:|
| `SPRING_PROFILES_ACTIVE`        | `prod`                                           | Sí        |
| `PGHOST`                        | Host PostgreSQL (`${{Postgres.PGHOST}}`)          | Sí        |
| `PGPORT`                        | Puerto PostgreSQL (`${{Postgres.PGPORT}}`)        | Sí        |
| `PGDATABASE`                    | Nombre DB (`${{Postgres.PGDATABASE}}`)            | Sí        |
| `PGUSER`                        | Usuario DB (`${{Postgres.PGUSER}}`)               | Sí        |
| `PGPASSWORD`                    | Contraseña DB (`${{Postgres.PGPASSWORD}}`)        | Sí        |
| `JWT_SECRET`                    | Secreto para firmar JWT (64+ chars hex)           | Sí        |
| `JWT_ACCESS_EXPIRATION_MINUTES` | Expiración del access token en min (default: 15)  | No        |
| `JWT_REFRESH_EXPIRATION_DAYS`   | Expiración del refresh token en días (default: 7) | No        |
| `ALLOWED_ORIGINS`               | URL del frontend (con `https://`)                 | Sí        |
| `SUPER_ADMIN_EMAIL`             | Email del SUPER_ADMIN inicial                     | Sí (1ª)   |
| `SUPER_ADMIN_PASSWORD`          | Password del SUPER_ADMIN inicial                  | Sí (1ª)   |
| `SUPER_ADMIN_FULL_NAME`         | Nombre completo del SUPER_ADMIN                   | No        |
| `HIBERNATE_DDL_AUTO`            | `validate` (default) — `none` solo para diagnóstico | No      |
| `FLYWAY_BASELINE_ON_MIGRATE`    | `false` (default) — `true` solo si DB ya tiene tablas | No   |

> **IMPORTANTE:** Railway expone `DATABASE_URL` en formato `postgresql://` que el driver JDBC rechaza.
> El backend construye la URL desde `PGHOST`/`PGPORT`/`PGDATABASE` automáticamente.
> **No usar `DATABASE_URL` directamente.** Ver `.env.example` para detalles.

## Generar JWT_SECRET seguro

```bash
# Linux / Mac
openssl rand -hex 64

# Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

## Estructura de paquetes (Fase 1)

```
com.stepup/
├── StepupApplication.java         Punto de entrada + @ConfigurationPropertiesScan
├── config/
│   ├── JwtProperties.java         @ConfigurationProperties JWT
│   ├── SecurityConfig.java        Spring Security con JWT filter
│   ├── WebConfig.java
│   └── OpenApiConfig.java
├── common/
│   ├── response/ApiResponse.java
│   ├── util/HashUtils.java        SHA-256 + SecureRandom
│   ├── util/SecurityUtils.java    Acceso al usuario del SecurityContext
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       ├── EmailAlreadyExistsException.java
│       ├── ForbiddenOperationException.java
│       ├── InvalidTokenException.java
│       └── UserNotActiveException.java
├── security/
│   ├── JwtService.java            Generación y validación de JWT
│   ├── JwtAuthenticationFilter.java
│   ├── StepUpUserDetails.java
│   ├── UserDetailsServiceImpl.java
│   ├── AuthEntryPoint.java        JSON 401
│   └── AccessDeniedHandlerImpl.java  JSON 403
├── auth/
│   ├── AuthController.java        /auth/login, /refresh, /logout, /me
│   ├── RefreshToken.java          Entidad JPA
│   ├── RefreshTokenRepository.java
│   ├── service/AuthService.java
│   └── dto/
├── users/
│   ├── User.java                  Entidad JPA
│   ├── Role.java                  Enum con jerarquía
│   ├── UserStatus.java            Enum
│   ├── UserRepository.java
│   ├── UserController.java        /users CRUD
│   ├── service/UserService.java
│   └── dto/
├── seed/
│   └── SuperAdminSeeder.java      ApplicationRunner
├── health/HealthController.java
└── info/PublicInfoController.java
```

## Tests

```bash
# Tests unitarios (sin DB — rápidos)
.\mvnw.cmd test -Dtest="JwtServiceTest,HashUtilsTest,RoleHierarchyTest" -DfailIfNoTests=false

# Todos los tests (requiere Docker para Testcontainers)
.\mvnw.cmd clean test
```

> **Nota**: Los tests de integración (`StepupApplicationTests`) usan Testcontainers y requieren
> Docker corriendo. Si Docker no está activo, esos tests fallan pero los unitarios pasan.

## Perfiles de configuración

| Perfil   | Archivo                      | Uso                                    |
|----------|------------------------------|----------------------------------------|
| `dev`    | `application-dev.yml`        | Desarrollo local con logs verbose      |
| `prod`   | `application-prod.yml`       | Producción (Railway), Swagger OFF      |
| `test`   | `application-test.yml`       | Tests con Testcontainers PostgreSQL    |

## Migraciones Flyway

| Archivo                               | Descripción                  |
|---------------------------------------|------------------------------|
| `V1__init_extensions.sql`             | Extensiones PostgreSQL       |
| `V2__create_users.sql`                | Tabla users                  |
| `V3__create_refresh_tokens.sql`       | Tabla refresh_tokens         |
| `V4__create_categories.sql`           | Tabla categories             |
| `V5__create_products.sql`             | Tabla products               |
| `V6__create_product_images.sql`       | Tabla product_images         |
| `V7__create_product_sizes.sql`        | Tabla product_sizes          |
| `V8__create_audit_logs.sql`           | Tabla audit_logs             |
| `V9__create_entity_snapshots.sql`     | Tabla entity_snapshots       |
| `V10__create_restore_actions.sql`     | Tabla restore_actions        |
| `V11__create_messages.sql`            | Tabla messages               |
| `V12__create_store_settings.sql`      | Tabla store_settings         |
| `V13__create_analytics_events.sql`    | Tabla analytics_events       |

### Verificar que las migraciones están empaquetadas en el JAR

Después de `./mvnw clean package -DskipTests`, verificar que todas las migraciones están incluidas:

```bash
# Unix/Mac
jar tf target/stepup-backend-*.jar | grep db/migration | sort

# Windows PowerShell
jar tf target/stepup-backend-0.1.0-SNAPSHOT.jar | Select-String "db/migration" | Sort-Object
```

Debe listar las 13 migraciones bajo `BOOT-INF/classes/db/migration/`.

También verificar directamente en `target/classes`:

```bash
# Unix/Mac
ls target/classes/db/migration/

# Windows PowerShell
Get-ChildItem target/classes/db/migration/
```

**Si `target/classes/db/migration/` no existe** significa que Maven no empaquetó los SQL. Verificar que `src/main/resources/db/migration/` existe y tiene los archivos `.sql`.

## Reglas de seguridad del SUPER_ADMIN

1. No puede ser creado desde ningún endpoint de la API.
2. No puede ser eliminado desde ningún endpoint de la API.
3. No puede ser editado, bloqueado ni degradado por usuarios inferiores.
4. No aparece en el listado de usuarios para OWNER, ADMIN, EDITOR, VIEWER.
5. Acceso exclusivo al Control Center (`/api/v1/control-center/**`).

## Qué queda pendiente para Fase 2

- Entidades y CRUD: `Product`, `Category`, `ProductImage`, `ProductSize`
- Migraciones V4–V7
- Búsqueda y filtros del catálogo público
- Slug automático desde el nombre
- Soft delete en productos y categorías
- Endpoints de visibilidad y stock status
