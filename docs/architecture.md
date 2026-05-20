# Arquitectura — StepUp

## Visión general

StepUp es una aplicación web con arquitectura de tres capas separadas:

```
┌─────────────────────────────────────────────────────┐
│                  Cliente / Browser                   │
│          Next.js 15 (TypeScript + Tailwind)          │
│              Puerto 3000 (local / Railway)            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST (JSON)
                       │ /api/v1/*
┌──────────────────────▼──────────────────────────────┐
│                  Spring Boot 4.0.6                   │
│             Java 25 · Spring Framework 7.x           │
│              Puerto 8080 (local / Railway)            │
│                                                     │
│  SecurityFilter → Controllers → Services → Repos    │
└──────────────────────┬──────────────────────────────┘
                       │ JDBC / JPA
┌──────────────────────▼──────────────────────────────┐
│                    PostgreSQL 16                     │
│              Puerto 5432 (local / Railway)            │
│         Migraciones gestionadas por Flyway           │
└─────────────────────────────────────────────────────┘
```

## Principios de diseño

| Principio                     | Aplicación                                                  |
|-------------------------------|-------------------------------------------------------------|
| Separación de capas           | Frontend nunca accede a la base de datos directamente        |
| DTOs separados de entidades   | Las entidades JPA no se exponen en la API                    |
| Stateless API                 | Autenticación por JWT, sin sesión en servidor                |
| Soft delete                   | Las entidades importantes no se borran físicamente           |
| Auditoría completa            | Snapshots before/after en JSONB para todas las entidades críticas |
| Versionado de API             | Todos los endpoints bajo `/api/v1/`                          |
| Variables de entorno          | Sin secretos hardcodeados                                    |
| Separación de perfiles        | dev / prod / test con configs distintas                      |

## Monorepo

```
stepup/
├── frontend/          App Next.js (no contiene lógica de negocio)
├── backend/           API Spring Boot (toda la lógica de negocio y datos)
├── docs/              Documentación estratégica
├── infra/             docker-compose.yml para desarrollo local
├── .env.example       Variables de entorno de referencia
├── .gitignore
└── README.md
```

## Flujo de request típico

```
Browser
  └─ HTTP GET /api/v1/products?category=zapatos
       └─ CorsFilter (valida origen)
            └─ SecurityFilter (valida JWT si aplica)
                 └─ ProductController
                      └─ ProductService
                           └─ ProductRepository (JPA)
                                └─ PostgreSQL
                                     └─ ResultSet
                                          └─ ProductMapper (MapStruct)
                                               └─ ProductResponse DTO
                                                    └─ ApiResponse<List<ProductResponse>>
                                                         └─ JSON response
```

## Módulos del backend

| Paquete                  | Responsabilidad                                      |
|--------------------------|------------------------------------------------------|
| `config/`                | SecurityConfig, WebConfig, OpenApiConfig             |
| `common/`                | ApiResponse, GlobalExceptionHandler, utilidades      |
| `security/`              | JWT utils, filtros, UserDetailsService               |
| `auth/`                  | Login, logout, refresh, /me                          |
| `users/`                 | CRUD de usuarios, roles, estado                      |
| `products/`              | CRUD de productos, imágenes, tallas                  |
| `categories/`            | CRUD de categorías                                   |
| `messages/`              | Mensajes de contacto                                 |
| `analytics/`             | Eventos de analítica, dashboard                      |
| `settings/`              | Configuración de tienda                              |
| `audit/`                 | Control Center, audit logs, snapshots, restore       |
| `health/`                | Health check endpoint                                |
| `info/`                  | Endpoint público de información                      |

## Módulos del frontend

| Carpeta                  | Responsabilidad                                      |
|--------------------------|------------------------------------------------------|
| `app/`                   | Páginas (Next.js App Router)                         |
| `components/layout/`     | Header, Footer, navegación                           |
| `components/ui/`         | Componentes shadcn/ui                                |
| `components/product/`    | Cards, detalle, imágenes de producto                 |
| `components/admin/`      | Componentes del panel administrativo                 |
| `hooks/`                 | React hooks personalizados                           |
| `lib/`                   | Cliente API, utilidades                              |
| `services/`              | Llamadas a la API por módulo                         |
| `types/`                 | TypeScript interfaces y tipos                        |

## Stack tecnológico completo

### Backend
- **Java 25** — LTS (usa Jakarta EE 11 namespace: `jakarta.*`)
- **Spring Boot 4.0.6** — Auto-configuración, starters
- **Spring Framework 7.x** — Core del framework
- **Spring Security 7.x** — Autenticación y autorización
- **Spring Data JPA** — Repositorios JPA
- **Hibernate 7.x** — ORM
- **Flyway** — Migraciones de base de datos
- **Lombok** — Reducción de boilerplate
- **MapStruct** — Mapeo entidades ↔ DTOs
- **Jakarta Validation** — Bean validation
- **springdoc-openapi** — Swagger UI (verificar versión para SB 4.0.6)
- **JUnit 5** — Tests unitarios
- **Testcontainers** — Tests de integración con PostgreSQL real

### Frontend
- **Next.js 15** — Framework React con App Router
- **TypeScript** — Tipado estático
- **Tailwind CSS** — Estilos utility-first
- **shadcn/ui** — Componentes de UI accesibles
- **TanStack Query v5** — Gestión de estado del servidor
- **React Hook Form** — Formularios
- **Zod** — Validación de esquemas
- **Axios** — Cliente HTTP
- **Lucide React** — Iconos
- **Recharts** — Gráficos
- **Sonner** — Notificaciones toast

### Infraestructura
- **PostgreSQL 16** — Base de datos principal
- **Docker** — Contenedores
- **Railway** — Platform as a Service para deploy
- **Docker Compose** — Desarrollo local

## Consideraciones de Spring Boot 4.0.6

Spring Boot 4.x implica:
1. **Spring Framework 7.x** — Requiere Java 17+ mínimo; Java 25 soportado
2. **Jakarta EE 11** — Todos los imports son `jakarta.*` (NO `javax.*`)
3. **Hibernate 7.x** — Compatible con Jakarta Persistence 3.2
4. **Spring Security 7.x** — API lambda consolidada (como 6.x pero con mejoras)
5. **Flyway 11.x** — Soporte nativo para PostgreSQL con módulo separado

> **Riesgo identificado:** La versión exacta de springdoc-openapi compatible con Spring Boot 4.0.6 debe verificarse al momento de implementar. Si no existe versión estable, considerar SpringFox (desactualizado) o implementar OpenAPI manualmente.
