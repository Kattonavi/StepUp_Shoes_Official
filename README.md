# StepUp

Plataforma web tipo catálogo/e-commerce administrable enfocada en zapatos, gorras, ropa y accesorios.

## Stack

| Capa       | Tecnología                                             |
|------------|--------------------------------------------------------|
| Frontend   | Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui     |
| Backend    | Java 25 · Spring Boot 4.0.6 · Spring Framework 7.x    |
| Base datos | PostgreSQL · Flyway                                    |
| Deploy     | Railway                                               |

## Estructura del monorepo

```
stepup/
├── frontend/          Next.js app
├── backend/           Spring Boot API
├── docs/              Documentación estratégica
├── infra/             Docker Compose local
├── .env.example       Variables de entorno de referencia
└── .gitignore
```

## Inicio rápido

### Prerequisitos

- Java 25 (Eclipse Temurin recomendado)
- Node.js 20+ y npm 10+
- Docker y Docker Compose
- PostgreSQL 16+ (o usar Docker)

### Base de datos local

```bash
docker compose -f infra/docker-compose.yml up -d
```

### Backend

```bash
cd backend
./mvnw clean compile        # Unix
.\mvnw.cmd clean compile    # Windows

./mvnw spring-boot:run -Pdev
```

Endpoints disponibles en `http://localhost:8080`:
- `GET /api/v1/health`
- `GET /api/v1/public/info`
- `GET /swagger-ui.html` (si springdoc compatible con SB 4.0.6)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:3000`.

## Variables de entorno

Copiar `.env.example` a `.env` y configurar los valores.
Ver también `frontend/.env.example` y `backend/.env.example`.

## Documentación

| Archivo                          | Contenido                              |
|----------------------------------|----------------------------------------|
| [requirements.md](docs/requirements.md)         | Requerimientos funcionales             |
| [architecture.md](docs/architecture.md)         | Arquitectura del sistema               |
| [modules.md](docs/modules.md)                   | Módulos y responsabilidades            |
| [roles-and-permissions.md](docs/roles-and-permissions.md) | Roles y matriz de permisos  |
| [database-model.md](docs/database-model.md)     | Modelo de base de datos                |
| [api-contract.md](docs/api-contract.md)         | Contrato REST API                      |
| [security.md](docs/security.md)                 | Estrategia de seguridad                |
| [control-center.md](docs/control-center.md)     | Control Center / SUPER_ADMIN           |
| [audit-and-recovery.md](docs/audit-and-recovery.md) | Auditoría y restauración           |
| [deployment.md](docs/deployment.md)             | Deploy en Railway                      |
| [development-roadmap.md](docs/development-roadmap.md) | Roadmap por fases               |
| [claude-workflow.md](docs/claude-workflow.md)   | Flujo de trabajo con Claude Code       |

## Fases

| Fase | Descripción                                          | Estado     |
|------|------------------------------------------------------|------------|
| 0    | Monorepo base, documentación, frontend y backend base | ✅ Actual  |
| 1    | Auth, usuarios, roles, JWT, SUPER_ADMIN               | Pendiente  |
| 2    | Productos, categorías, imágenes, tallas               | Pendiente  |
| 3    | Auditoría, snapshots, soft delete, Control Center     | Pendiente  |
| 4    | Frontend público completo                             | Pendiente  |
| 5    | Frontend admin completo                               | Pendiente  |
| 6    | Mensajes, analíticas, configuración                   | Pendiente  |
| 7    | Deploy en Railway                                     | Pendiente  |
| 8    | Testing, seguridad y optimización                     | Pendiente  |

## Notas importantes

- El frontend **nunca** accede directamente a PostgreSQL.
- El backend es la única capa que lee y escribe en la base de datos.
- No usar Next.js API routes como backend principal.
- SUPER_ADMIN tiene acceso exclusivo al Control Center.
- Todos los secretos deben estar en variables de entorno, nunca en el repositorio.
