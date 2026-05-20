# Flujo de trabajo con Claude Code — StepUp

## Propósito

Este documento establece cómo usar Claude Code de forma efectiva en el desarrollo de StepUp, qué prompts funcionan bien, cómo estructurar las conversaciones por fase y qué contexto dar en cada sesión.

## Principios generales

1. **Una fase a la vez.** No pedir que Claude implemente múltiples fases en un solo prompt.
2. **Contexto explícito.** Siempre mencionar: fase actual, stack (Java 25 + Spring Boot 4.0.6), y qué archivos ya existen.
3. **Arquitectura no negociable.** Claude debe respetar la separación frontend/backend, DTOs separados, seguridad de roles.
4. **TODOs respetados.** No implementar lo que está marcado como `TODO(phase-X)` antes de tiempo.
5. **Placeholders honrados.** Si algo no se implementa en esta fase, debe quedar marcado claramente.

## Prompt recomendado para Fase 1 (Auth)

```
Contexto:
- Proyecto StepUp, monorepo en /frontend y /backend.
- Backend: Java 25, Spring Boot 4.0.6, Spring Framework 7.x.
- Frontend: Next.js 15, TypeScript, Tailwind CSS.
- Fase actual: FASE 1 — Autenticación y Usuarios.
- La Fase 0 (base) ya está completada.

Lo que necesito implementar ahora:
1. Entidad User con JPA (jakarta.persistence.*), roles enum, soft delete.
2. Migración Flyway V2__users.sql y V3__refresh_tokens.sql.
3. UserDetailsServiceImpl para Spring Security.
4. JwtTokenProvider: generate, validate, extract claims.
5. JwtAuthenticationFilter.
6. Endpoints /auth/login, /auth/refresh, /auth/logout, /auth/me.
7. Seed de SUPER_ADMIN al iniciar (solo si no existe).
8. CRUD básico de usuarios con protección de roles.

NO implementar todavía:
- CRUD de productos o categorías.
- Auditoría completa.
- Frontend de admin completo.

Stack obligatorio en el backend:
- Importaciones: jakarta.persistence.*, jakarta.validation.*
- NO javax.*
- Lombok con @Data, @Builder, @RequiredArgsConstructor
- MapStruct para DTOs
- Spring Security 7.x con HttpSecurity lambda API
```

## Prompt recomendado para Fase 2 (Productos)

```
Contexto:
- Proyecto StepUp, Fase 2 — Productos y Categorías.
- Backend: Java 25, Spring Boot 4.0.6.
- Fase 1 completada: Auth, usuarios, JWT funcionando.

Necesito:
1. Entidades: Category, Product, ProductImage, ProductSize (JPA, jakarta.*)
2. Migraciones Flyway V4 a V7.
3. Services con soft delete (deleted_at, deleted_by).
4. Repositorios JPA con queries por slug, por categoría, con filtros.
5. DTOs de request/response con MapStruct.
6. Endpoints REST versionados bajo /api/v1/.
7. Validación con Jakarta Validation.
8. Slug generado automáticamente desde el nombre.

Restricciones:
- ProductStatus enum: ACTIVE, DRAFT, HIDDEN, DELETED.
- StockStatus enum: AVAILABLE, OUT_OF_STOCK, ON_REQUEST.
- IDs tipo UUID generados por BD.
- Soft delete: no borrado físico en products ni categories.
```

## Convenciones para prompts de código

### Al pedir clases Java
```
Crea [NombreClase] en el paquete com.stepup.[modulo].
Usa:
- @RequiredArgsConstructor para inyección de dependencias
- Lombok @Builder en DTOs
- jakarta.* en lugar de javax.*
- records para DTOs de request si aplica
```

### Al pedir componentes React
```
Crea [NombreComponente] en frontend/components/[carpeta]/[Nombre].tsx.
Usa:
- TypeScript estricto, sin 'any'
- Tailwind CSS para estilos
- Componentes shadcn/ui si corresponde
- Marcar con TODO(phase-X) si algo es placeholder
```

### Al pedir páginas Next.js
```
Crea la página en frontend/app/[ruta]/page.tsx.
Si la página requiere datos reales de API que no están implementados aún,
créala como placeholder con un TODO(phase-X) claro.
Usa el App Router de Next.js 15.
```

## Qué contexto incluir en cada sesión

Al iniciar una nueva sesión de Claude Code en este proyecto:
1. Mencionar la fase actual.
2. Mencionar qué archivos existen y cuáles son placeholders.
3. Indicar qué se quiere implementar en esa sesión.
4. Pedir que respete los TODOs existentes.

## Control de calidad

Antes de dar por terminada una fase, verificar:

### Backend
```bash
.\mvnw.cmd clean compile    # Sin errores de compilación
.\mvnw.cmd test             # Tests pasan
.\mvnw.cmd spring-boot:run  # Arranca sin errores
curl http://localhost:8080/api/v1/health  # Responde
```

### Frontend
```bash
npm run type-check   # Sin errores TypeScript
npm run build        # Build exitoso
npm run dev          # Arranca en localhost:3000
```

## Gestión de versiones / Git

Commits recomendados por fase:

```
chore: initialize StepUp with Java 25 and Spring Boot 4       (fase-0)
feat(auth): implement JWT authentication and user management   (fase-1)
feat(catalog): add products, categories and inventory          (fase-2)
feat(audit): implement audit logs, snapshots and control center (fase-3)
feat(public): implement public catalog frontend                (fase-4)
feat(admin): implement admin panel frontend                    (fase-5)
feat(messages): add messages, analytics and store settings     (fase-6)
chore(deploy): configure Railway deployment                    (fase-7)
chore(quality): add tests, security hardening and optimization (fase-8)
```

## Notas sobre Spring Boot 4.0.6

- Si alguna librería no tiene versión compatible con SB 4.0.6 disponible en Maven Central, buscar la alternativa más cercana o documentar el bloqueo.
- springdoc-openapi puede requerir versión 3.x: verificar antes de implementar.
- Testcontainers: asegurarse de que Docker esté corriendo al ejecutar tests de integración.
- Lombok con Java 25: el procesador de anotaciones debe configurarse correctamente en pom.xml.
