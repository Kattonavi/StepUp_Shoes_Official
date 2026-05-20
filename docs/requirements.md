# Requerimientos funcionales — StepUp

## 1. Catálogo público

### 1.1 Páginas
| Página                  | Descripción                                              |
|-------------------------|----------------------------------------------------------|
| Home (`/`)              | Página de inicio con productos destacados, nuevos, rebaja |
| Catálogo (`/catalogo`)  | Grid de productos con filtros y búsqueda                 |
| Producto (`/producto/[slug]`) | Detalle de producto con botón de WhatsApp         |
| 404                     | Página de error 404 amigable                             |
| Error                   | Página de error genérica                                 |

### 1.2 Filtros y búsqueda
- Búsqueda por nombre (texto libre)
- Filtro por categoría
- Filtro por rango de precio (min/max)
- Filtro por disponibilidad (AVAILABLE / OUT_OF_STOCK / ON_REQUEST)
- Filtro por etiquetas: `es_nuevo`, `en_rebaja`, `es_destacado`

### 1.3 Producto
- Imágenes múltiples con imagen principal
- Precio actual y precio anterior (tachado)
- Porcentaje de descuento calculado o manual
- Tallas disponibles con stock por talla
- Descripción completa
- Botón de WhatsApp con mensaje predefinido
- SEO: `<title>`, `<meta description>`, Open Graph
- Slug amigable único

### 1.4 WhatsApp
- Botón que genera un enlace `wa.me/{telefono}?text={mensaje}`
- El mensaje incluye nombre del producto, talla seleccionada y URL

## 2. Panel administrativo

### 2.1 Autenticación
- Login con email y contraseña
- JWT de corta duración + Refresh Token
- Logout que invalida el refresh token
- Endpoint `/auth/me` para verificar sesión

### 2.2 Dashboard
- Métricas principales: vistas de productos, clics en WhatsApp, mensajes recibidos
- Productos más vistos (top 5)
- Actividad reciente

### 2.3 Gestión de productos
- Listado con paginación, búsqueda y filtros
- Crear/editar/eliminar (soft delete)
- Gestión de imágenes: subir, ordenar, marcar principal
- Gestión de tallas: agregar/quitar tallas y stock por talla
- Cambiar estado: ACTIVE, DRAFT, HIDDEN
- Cambiar stock status: AVAILABLE, OUT_OF_STOCK, ON_REQUEST
- Toggles: `es_nuevo`, `en_rebaja`, `es_destacado`
- Gestión de SEO por producto

### 2.4 Gestión de categorías
- Crear/editar/eliminar (soft delete)
- Ordenar por posición
- Activar/desactivar

### 2.5 Mensajes / Contacto
- Listado con indicador de leído/no leído
- Ver detalle del mensaje
- Marcar como leído
- Agregar notas internas
- Ver producto relacionado si aplica

### 2.6 Analíticas
- Dashboard con métricas por rango de fechas
- Vistas de productos (top productos)
- Clics en WhatsApp
- Vistas de categorías
- Gráficos de evolución temporal (Recharts)

### 2.7 Usuarios
- Listar usuarios
- Crear usuario (con rol: OWNER, ADMIN, EDITOR, VIEWER)
- Editar usuario
- Cambiar estado (activo/bloqueado)
- Cambiar rol (solo jerarquía permitida)

### 2.8 Configuración de tienda
- Nombre de tienda
- Logo
- WhatsApp principal
- Mensaje base de WhatsApp
- Redes sociales (Instagram, Facebook, TikTok, etc.)
- Texto e imágenes del home
- Configuración SEO global (título, descripción, OG image)
- Estado de mantenimiento

### 2.9 Control Center (solo SUPER_ADMIN)
- Historial global de cambios
- Auditoría de acciones administrativas
- Elementos eliminados
- Restauración de entidades eliminadas
- Comparación before/after de snapshots
- Registro de restauraciones
- Actividad crítica y de seguridad
- Bloqueo/suspensión de usuarios

## 3. Modelo de producto

```
Producto {
  id: UUID
  nombre: String
  slug: String (único)
  descripcion: Text
  categoria_id: UUID
  precio_actual: Decimal
  precio_anterior: Decimal (opcional)
  porcentaje_descuento: Integer (opcional)
  estado: ACTIVE | DRAFT | HIDDEN | DELETED
  stock_status: AVAILABLE | OUT_OF_STOCK | ON_REQUEST
  es_nuevo: Boolean
  en_rebaja: Boolean
  es_destacado: Boolean
  seo_title: String
  seo_description: String
  orden: Integer
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp (nullable)
  deleted_by: UUID (nullable)

  imagenes: ProductImage[]
  tallas: ProductSize[]
}
```

## 4. Modelo de categoría

```
Categoria {
  id: UUID
  nombre: String
  slug: String (único)
  icono: String (nombre de icono Lucide o URL)
  descripcion: Text
  posicion: Integer
  activa: Boolean
  created_at: Timestamp
  updated_at: Timestamp
  deleted_at: Timestamp (nullable)
  deleted_by: UUID (nullable)
}
```

## 5. Modelo de mensaje/contacto

```
Mensaje {
  id: UUID
  nombre: String
  email: String (opcional)
  telefono: String (opcional)
  mensaje: Text
  producto_id: UUID (opcional)
  leido: Boolean
  notas_internas: Text (opcional)
  created_at: Timestamp
}
```

## 6. Analíticas

Evento de analítica:
```
AnalyticsEvent {
  id: UUID
  tipo: PRODUCT_VIEW | CATEGORY_VIEW | WHATSAPP_CLICK | PAGE_VIEW
  entidad_id: UUID (opcional)
  metadata: JSONB (opcional)
  ip_hash: String (opcional)
  user_agent: String (opcional)
  created_at: Timestamp
}
```

## 7. Configuración de tienda

```
StoreSettings {
  id: UUID (siempre existe un único registro)
  nombre: String
  logo_url: String
  whatsapp: String
  mensaje_base_whatsapp: String
  redes_sociales: JSONB
  texto_home: Text
  seo_title: String
  seo_description: String
  og_image_url: String
  en_mantenimiento: Boolean
  updated_at: Timestamp
  updated_by: UUID
}
```

## 8. No implementado en Fase 0

- CRUD completo real de productos, categorías, mensajes
- Auth JWT funcional
- Subida de imágenes
- Analíticas en tiempo real
- Exportación de datos
- Notificaciones por email
- Multi-idioma
- Múltiples tiendas
