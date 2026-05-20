# Deploy en Railway — StepUp

## Arquitectura de producción

```
Railway Project: stepup
├── Service: stepup-backend     (Spring Boot 4.0.6, Java 25)
├── Service: stepup-frontend    (Next.js 15)
└── Database: PostgreSQL        (gestionado por Railway)
```

## Prerequisitos

- Cuenta en Railway (railway.app)
- Railway CLI instalado: `npm install -g @railway/cli`
- Docker instalado localmente para pruebas
- Repositorio en GitHub (opcional para deploy automático)

## Paso a paso

### 1. Crear proyecto en Railway

```bash
railway login
railway init
# Nombre del proyecto: stepup
```

### 2. Crear servicio PostgreSQL

Desde el dashboard de Railway:
1. New Service → Database → PostgreSQL
2. Railway provee automáticamente `DATABASE_URL` como variable de entorno.

### 3. Deploy del backend

```bash
cd backend
railway service create stepup-backend
railway up
```

O conectar el repositorio GitHub para deploy automático en cada push a `main`.

**Variables de entorno requeridas en Railway (backend):**
```
DATABASE_URL=postgresql://user:password@host:port/dbname
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<secreto-seguro-64-chars>
JWT_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000
ALLOWED_ORIGINS=https://stepup-frontend.railway.app
SUPER_ADMIN_EMAIL=superadmin@stepup.com
SUPER_ADMIN_PASSWORD=<password-muy-seguro>
```

### 4. Deploy del frontend

```bash
cd frontend
railway service create stepup-frontend
railway up
```

**Variables de entorno requeridas en Railway (frontend):**
```
NEXT_PUBLIC_API_BASE_URL=https://stepup-backend.railway.app/api/v1
NODE_ENV=production
```

### 5. Configurar dominios

En el dashboard de Railway, cada servicio tiene una URL generada automáticamente:
- Backend: `stepup-backend-production.railway.app`
- Frontend: `stepup-frontend-production.railway.app`

Opcionalmente, configurar dominio personalizado:
- `api.stepup.com` → backend
- `www.stepup.com` o `stepup.com` → frontend

## Dockerfiles

### backend/Dockerfile

```dockerfile
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src/ src/
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", "-jar", "app.jar"]
```

### frontend/Dockerfile

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Docker Compose local (infra/docker-compose.yml)

Para desarrollo local solo necesitamos PostgreSQL:

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: stepup_dev
      POSTGRES_USER: stepup
      POSTGRES_PASSWORD: changeme
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Configuración de Railway con railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile"
  },
  "deploy": {
    "startCommand": "java -jar app.jar",
    "healthcheckPath": "/api/v1/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## Verificación de deploy

```bash
# Health check
curl https://stepup-backend.railway.app/api/v1/health

# Info pública
curl https://stepup-backend.railway.app/api/v1/public/info
```

## Notas importantes

1. Railway provee HTTPS automático para todos los servicios.
2. La variable `DATABASE_URL` de Railway tiene el formato `postgresql://` y es compatible con Spring Boot directamente si se configura correctamente en `application-prod.yml`.
3. Los logs de Railway se ven con `railway logs`.
4. Railway reinicia el servicio automáticamente si falla (`ON_FAILURE` policy).
5. Se recomienda usar Railway Volumes para storage de imágenes en el futuro **TODO(phase-2)**.

## Pipeline CI/CD recomendado (TODO phase-8)

```
Push a main →
  GitHub Actions →
    1. mvn test (backend)
    2. npm test (frontend)
    3. Si pasa → Railway deploy automático
```
