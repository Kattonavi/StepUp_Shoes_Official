# Seguridad — StepUp

## Estrategia general

StepUp usa una arquitectura stateless con JWT. El servidor no almacena sesiones. La autenticación se verifica en cada request mediante un access token de corta duración.

## Tokens

### Access Token (JWT)
- Algoritmo: `HS256` (HMAC-SHA256) con secreto seguro de mínimo 64 caracteres
- Duración: **15 minutos** (`JWT_EXPIRATION_MS=900000`)
- Payload: `{ sub: userId, email, role, iat, exp }`
- Ubicación en request: `Authorization: Bearer <token>`

### Refresh Token
- Generado como UUID aleatorio seguro (no JWT)
- Se guarda como **hash bcrypt** en la tabla `refresh_tokens`
- Duración: **7 días** (`JWT_REFRESH_EXPIRATION_MS=604800000`)
- Se invalida al hacer logout o al rotarse
- Estrategia: **Rotation** — cada uso genera un nuevo refresh token y revoca el anterior

### Recomendación: Authorization Header vs Cookies

**Decisión adoptada: Authorization Header + localStorage para access token, httpOnly cookie para refresh token.**

Justificación:
- El access token en `Authorization: Bearer` es el estándar de APIs REST.
- El refresh token en **cookie httpOnly** protege contra XSS ya que JavaScript no puede leerlo.
- Combinación ofrece protección XSS (para el token más crítico) y compatibilidad CORS.

Alternativa rechazada (ambos en cookies httpOnly):
- Requiere configuración CSRF adicional.
- Complicación con Next.js y llamadas del lado del servidor.

## Almacenamiento de contraseñas

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12); // cost factor 12
}
```

- Nunca se almacenan contraseñas en texto plano.
- BCrypt con factor de costo 12 (seguro y manejable en hardware moderno).

## CORS

```java
config.setAllowedOrigins(List.of(frontendUrl)); // desde variable de entorno
config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
config.setAllowedHeaders(List.of("Authorization","Content-Type","X-Requested-With"));
config.setExposedHeaders(List.of("Authorization"));
config.setAllowCredentials(true); // necesario para cookies
config.setMaxAge(3600L);
```

- **Orígenes permitidos**: solo el dominio del frontend (variable de entorno `ALLOWED_ORIGINS`)
- **Wildcard `*` prohibido** en producción cuando `allowCredentials = true`

## Endpoints públicos

Los siguientes endpoints no requieren autenticación:

```
GET  /api/v1/health
GET  /api/v1/public/info
GET  /api/v1/products           (catálogo público)
GET  /api/v1/products/{id}
GET  /api/v1/products/slug/{slug}
GET  /api/v1/categories
GET  /api/v1/settings           (configuración pública)
POST /api/v1/messages           (formulario de contacto)
POST /api/v1/analytics/events   (eventos anónimos)
GET  /swagger-ui/**
GET  /v3/api-docs/**
```

## Spring Security — Configuración base (Fase 0)

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
            .anyRequest().authenticated()
        )
        // TODO(phase-1): Agregar JwtAuthenticationFilter
        .build();
}
```

## Bean Validation

Todas las entradas de usuario se validan con Jakarta Validation:

```java
public record CreateProductRequest(
    @NotBlank String nombre,
    @NotNull @Positive BigDecimal precioActual,
    @Size(max = 1000) String descripcion
) {}
```

Los errores de validación retornan `400 Bad Request` con detalles por campo.

## Protección de SUPER_ADMIN

1. El rol `SUPER_ADMIN` no puede asignarse por API.
2. Los endpoints de gestión de usuarios filtran SUPER_ADMIN de los resultados.
3. Ningún endpoint de modificación de usuario aplica a SUPER_ADMIN.
4. El seed inicial crea el SUPER_ADMIN antes de que el sistema esté disponible.
5. Las operaciones sobre SUPER_ADMIN en el backend retornan `403` sin importar quién las llame.

## DTOs — Separación de entidades

```
Request DTO → Validación → Service → Entity → Repository
Repository → Entity → Mapper (MapStruct) → Response DTO → JSON
```

- Las entidades JPA **nunca se exponen directamente** en la API.
- Los mappers MapStruct convierten automáticamente entre capas.
- Los campos sensibles (`password_hash`, `token_hash`) nunca aparecen en respuestas.

## Manejo centralizado de errores

`GlobalExceptionHandler` captura:
- `MethodArgumentNotValidException` → 400 con lista de errores por campo
- `ConstraintViolationException` → 400
- `EntityNotFoundException` → 404
- `AccessDeniedException` → 403
- `BadCredentialsException` → 401
- `RuntimeException` genérica → 500

## Variables de entorno sensibles

```yaml
# Nunca hardcodear en código o application.yml
JWT_SECRET: ${JWT_SECRET}            # mínimo 64 caracteres
DB_PASSWORD: ${DB_PASSWORD}
SUPER_ADMIN_PASSWORD: ${SUPER_ADMIN_PASSWORD}
```

## Logs de seguridad

Eventos a registrar en `admin_activity` y/o `audit_logs`:
- Login exitoso (usuario, IP hash, user-agent)
- Login fallido (email, IP hash — sin exponer si existe)
- Logout
- Cambio de contraseña
- Cambio de rol de usuario
- Creación/eliminación de usuario
- Acceso al Control Center

## Rate Limiting

**TODO(phase-8):** Implementar rate limiting con Spring Cloud Gateway o Bucket4j:
- `/auth/login`: 5 intentos por minuto por IP
- `/auth/refresh`: 10 por minuto por IP
- `/api/v1/public/*`: 100 por minuto por IP

## Checklist de seguridad

- [ ] Secreto JWT de 64+ caracteres en variable de entorno
- [ ] BCrypt con factor 12+
- [ ] CORS restringido a dominio frontend
- [ ] Refresh token en cookie httpOnly en producción
- [ ] Endpoints admin protegidos con roles
- [ ] SUPER_ADMIN inaccesible desde UI
- [ ] DTOs separados de entidades
- [ ] Sin secretos en el repositorio
- [ ] Validación de entrada en todos los endpoints
- [ ] Logs de seguridad activos
- [ ] Rate limiting (fase 8)
- [ ] HTTPS obligatorio en producción (Railway lo provee)
