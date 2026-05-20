# Módulos del sistema — StepUp

## Backend (Java 25 / Spring Boot 4.0.6)

### Estructura de paquetes

```
com.stepup/
├── StepupApplication.java         Punto de entrada
├── config/                        Configuraciones globales
│   ├── SecurityConfig.java        Spring Security
│   ├── WebConfig.java             CORS y MVC
│   └── OpenApiConfig.java         Swagger/OpenAPI
├── common/                        Utilidades compartidas
│   ├── response/
│   │   ├── ApiResponse.java       Wrapper de respuesta genérica
│   │   └── PageResponse.java      Wrapper de respuesta paginada
│   └── exception/
│       └── GlobalExceptionHandler.java
├── security/                      TODO(phase-1)
│   ├── JwtTokenProvider.java      Generación y validación JWT
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailsServiceImpl.java
├── auth/                          TODO(phase-1)
│   ├── AuthController.java
│   ├── AuthService.java
│   └── dto/
├── users/                         TODO(phase-1)
│   ├── UserController.java
│   ├── UserService.java
│   ├── UserRepository.java
│   ├── User.java                  Entidad JPA
│   ├── Role.java                  Enum de roles
│   └── dto/
├── products/                      TODO(phase-2)
│   ├── ProductController.java
│   ├── ProductService.java
│   ├── ProductRepository.java
│   ├── Product.java
│   ├── ProductStatus.java
│   ├── StockStatus.java
│   └── dto/
├── categories/                    TODO(phase-2)
│   ├── CategoryController.java
│   ├── CategoryService.java
│   ├── CategoryRepository.java
│   ├── Category.java
│   └── dto/
├── messages/                      TODO(phase-6)
│   ├── MessageController.java
│   ├── MessageService.java
│   ├── MessageRepository.java
│   ├── Message.java
│   └── dto/
├── analytics/                     TODO(phase-6)
│   ├── AnalyticsController.java
│   ├── AnalyticsService.java
│   ├── AnalyticsEventRepository.java
│   ├── AnalyticsEvent.java
│   ├── EventType.java
│   └── dto/
├── settings/                      TODO(phase-6)
│   ├── SettingsController.java
│   ├── SettingsService.java
│   ├── SettingsRepository.java
│   ├── StoreSettings.java
│   └── dto/
├── audit/                         TODO(phase-3)
│   ├── ControlCenterController.java
│   ├── AuditService.java
│   ├── AuditLogRepository.java
│   ├── EntitySnapshotRepository.java
│   ├── RestoreActionRepository.java
│   ├── AuditLog.java
│   ├── EntitySnapshot.java
│   ├── RestoreAction.java
│   └── dto/
├── health/                        Fase 0 ✅
│   └── HealthController.java
└── info/                          Fase 0 ✅
    └── PublicInfoController.java
```

### Responsabilidades por módulo

| Módulo          | Controller       | Service               | Repository          |
|-----------------|------------------|-----------------------|---------------------|
| `health/`       | Endpoint /health | —                     | —                   |
| `info/`         | Endpoint /public/info | —                | —                   |
| `config/`       | —                | —                     | —                   |
| `common/`       | —                | —                     | —                   |
| `security/`     | —                | JWT, UserDetails      | —                   |
| `auth/`         | Login/logout/me  | Token management      | RefreshTokenRepo    |
| `users/`        | CRUD usuarios    | User management       | UserRepo            |
| `products/`     | CRUD productos   | Business logic        | ProductRepo         |
| `categories/`   | CRUD categorías  | Business logic        | CategoryRepo        |
| `messages/`     | CRUD mensajes    | Messaging             | MessageRepo         |
| `analytics/`    | Dashboard, events| Event tracking        | AnalyticsRepo       |
| `settings/`     | Config tienda    | Store config          | SettingsRepo        |
| `audit/`        | Control Center   | Audit + Restore       | AuditLog/Snapshot   |

---

## Frontend (Next.js 15 / TypeScript)

### Estructura de carpetas

```
frontend/
├── app/                               Next.js App Router
│   ├── layout.tsx                     Layout raíz (fuentes, providers)
│   ├── page.tsx                       Home público
│   ├── globals.css                    Estilos globales + Tailwind
│   ├── not-found.tsx                  Página 404
│   ├── error.tsx                      Página de error
│   ├── catalogo/
│   │   └── page.tsx                   TODO(phase-4): Catálogo completo
│   ├── producto/
│   │   └── [slug]/
│   │       └── page.tsx               TODO(phase-4): Detalle de producto
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx               TODO(phase-1): Login conectado
│   └── admin/
│       ├── layout.tsx                 Layout admin (sidebar, auth guard)
│       ├── page.tsx                   TODO(phase-5): Dashboard real
│       ├── productos/
│       │   └── page.tsx               TODO(phase-5): CRUD productos
│       ├── categorias/
│       │   └── page.tsx               TODO(phase-5): CRUD categorías
│       ├── mensajes/
│       │   └── page.tsx               TODO(phase-6): Mensajes
│       ├── analiticas/
│       │   └── page.tsx               TODO(phase-6): Analytics
│       ├── usuarios/
│       │   └── page.tsx               TODO(phase-5): Gestión usuarios
│       ├── configuracion/
│       │   └── page.tsx               TODO(phase-6): Config tienda
│       └── control-center/
│           └── page.tsx               TODO(phase-5): Control Center SUPER_ADMIN
├── components/
│   ├── ui/                            Componentes shadcn/ui (generados con CLI)
│   ├── layout/
│   │   ├── Header.tsx                 Navbar pública
│   │   ├── Footer.tsx                 Footer público
│   │   └── AdminSidebar.tsx           TODO(phase-5): Sidebar admin
│   ├── product/
│   │   ├── ProductCard.tsx            TODO(phase-4): Card de catálogo
│   │   ├── ProductGrid.tsx            TODO(phase-4): Grid de productos
│   │   └── ProductDetail.tsx          TODO(phase-4): Detalle de producto
│   └── admin/
│       ├── StatsCard.tsx              TODO(phase-5): Card de métricas
│       └── DataTable.tsx              TODO(phase-5): Tabla de datos
├── hooks/
│   ├── useAuth.ts                     TODO(phase-1): Hook de autenticación
│   ├── useProducts.ts                 TODO(phase-4): Hook de productos
│   └── useCategories.ts               TODO(phase-4): Hook de categorías
├── lib/
│   ├── api.ts                         Cliente Axios centralizado
│   └── utils.ts                       Utilidades (cn, formatPrice, etc.)
├── services/
│   ├── auth.service.ts                TODO(phase-1)
│   ├── products.service.ts            TODO(phase-4)
│   ├── categories.service.ts          TODO(phase-4)
│   └── analytics.service.ts           TODO(phase-6)
└── types/
    └── index.ts                       Interfaces TypeScript globales
```

### Convenciones del frontend

| Convención              | Detalle                                           |
|-------------------------|---------------------------------------------------|
| Componentes             | PascalCase, un archivo por componente             |
| Hooks                   | camelCase, prefijo `use`                          |
| Servicios               | camelCase con sufijo `.service.ts`               |
| Types / Interfaces      | PascalCase, en `types/index.ts` o colocalizado   |
| Variables de entorno    | `NEXT_PUBLIC_` solo para variables del cliente    |
| Rutas de API            | Solo vía `services/` → `lib/api.ts`              |
| Validación de forms     | React Hook Form + Zod                            |
| Estado del servidor     | TanStack Query                                   |
| Notificaciones          | Sonner                                           |

### Variables de entorno del frontend

```
NEXT_PUBLIC_API_BASE_URL    URL base del backend (/api/v1)
NEXT_PUBLIC_WA_NUMBER       Número WhatsApp por defecto
NODE_ENV                    development | production
```

Variables sin `NEXT_PUBLIC_` son solo del servidor (SSR) y nunca se exponen al navegador.
