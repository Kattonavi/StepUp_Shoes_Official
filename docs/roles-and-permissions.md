# Roles y Permisos — StepUp

## Jerarquía de roles

```
SUPER_ADMIN  ← único, del sistema, inmodificable
    └── OWNER
          └── ADMIN
                └── EDITOR
                      └── VIEWER
```

## Descripción de roles

### SUPER_ADMIN
- Rol superior absoluto del sistema.
- Solo existe para el creador/sistema. Se crea mediante seed seguro al iniciar.
- **No puede ser creado** desde el panel administrativo.
- **No puede ser eliminado** desde el panel administrativo.
- **No puede ser editado** por ningún otro rol (incluido OWNER).
- **No puede ser visto** en la lista de usuarios por OWNER, ADMIN, EDITOR, VIEWER.
- No se puede asignar este rol desde la UI.
- Tiene todos los permisos de OWNER más acceso exclusivo al Control Center.

### OWNER
- Propietario de la tienda.
- Tiene control total sobre la tienda excepto el Control Center.
- Puede gestionar usuarios de roles inferiores (ADMIN, EDITOR, VIEWER).
- No puede crear, editar, ver ni asignar el rol SUPER_ADMIN.

### ADMIN
- Administrador de operaciones.
- Puede gestionar productos, categorías, mensajes y analíticas.
- No puede gestionar usuarios superiores (OWNER).
- No puede cambiar la configuración crítica de seguridad.

### EDITOR
- Editor de contenido.
- Puede crear y editar productos y categorías.
- No puede eliminar, cambiar configuración ni gestionar usuarios.

### VIEWER
- Solo lectura.
- Puede ver productos, categorías, mensajes y analíticas.
- No puede modificar nada.

---

## Matriz de permisos por módulo

Leyenda: ✅ = Permitido | ❌ = No permitido | 👁 = Solo lectura | ⚡ = Solo creación/edición

| Módulo / Acción              | SUPER_ADMIN | OWNER | ADMIN | EDITOR | VIEWER |
|------------------------------|:-----------:|:-----:|:-----:|:------:|:------:|
| **Productos — Ver**           | ✅ | ✅ | ✅ | ✅ | 👁 |
| **Productos — Crear**         | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Productos — Editar**        | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Productos — Eliminar**      | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Productos — Restaurar**     | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Categorías — Ver**          | ✅ | ✅ | ✅ | ✅ | 👁 |
| **Categorías — Crear/Editar** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Categorías — Eliminar**     | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Categorías — Restaurar**    | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Mensajes — Ver**            | ✅ | ✅ | ✅ | ❌ | 👁 |
| **Mensajes — Marcar leído**   | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Mensajes — Notas internas** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Mensajes — Eliminar**       | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Analíticas — Ver**          | ✅ | ✅ | ✅ | ❌ | 👁 |
| **Usuarios — Listar**         | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Usuarios — Crear OWNER**    | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Usuarios — Crear ADMIN**    | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Usuarios — Crear EDITOR**   | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Usuarios — Crear VIEWER**   | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Usuarios — Bloquear**       | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Config. tienda — Ver**      | ✅ | ✅ | 👁 | ❌ | ❌ |
| **Config. tienda — Editar**   | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Control Center**            | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Audit Logs — Ver globales** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Snapshots — Ver/Restaurar** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Seguridad — Actividad**     | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Reglas especiales de SUPER_ADMIN

1. **Protección del rol**: El campo `role = SUPER_ADMIN` no puede asignarse mediante API pública. Solo existe a través del seed inicial.
2. **Invisibilidad**: Los endpoints de listado de usuarios filtran automáticamente los usuarios con `role = SUPER_ADMIN` para cualquier usuario diferente de SUPER_ADMIN.
3. **No eliminable**: Los endpoints de eliminación retornan `403 Forbidden` si el usuario objetivo tiene `role = SUPER_ADMIN`.
4. **No editable**: Los endpoints de edición retornan `403 Forbidden` si el usuario objetivo tiene `role = SUPER_ADMIN`.
5. **Protección en cambio de rol**: El servicio de cambio de rol valida que el caller no pueda asignar un rol igual o superior al propio.

## Reglas de jerarquía para cambio de rol

Un usuario solo puede asignar roles **estrictamente inferiores** al propio:

| Caller      | Puede asignar                          |
|-------------|----------------------------------------|
| SUPER_ADMIN | OWNER, ADMIN, EDITOR, VIEWER           |
| OWNER       | ADMIN, EDITOR, VIEWER                  |
| ADMIN       | EDITOR, VIEWER                         |
| EDITOR      | (no puede asignar roles)               |
| VIEWER      | (no puede asignar roles)               |

## Implementación

En Spring Security, los roles se mapean como `ROLE_SUPER_ADMIN`, `ROLE_OWNER`, etc.

Las anotaciones de seguridad en controladores:
```java
@PreAuthorize("hasRole('SUPER_ADMIN')")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OWNER')")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OWNER', 'ADMIN')")
```

Ver [security.md](security.md) para detalles de implementación.
