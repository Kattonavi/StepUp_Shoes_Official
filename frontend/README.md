# StepUp Frontend

Aplicación web del proyecto StepUp, construida con Next.js 15 y TypeScript.

## Stack

- **Next.js 15** — App Router, SSR/SSG, output standalone
- **TypeScript** — Tipado estático estricto
- **Tailwind CSS** — Estilos utility-first
- **shadcn/ui** — Componentes de UI (instalar con CLI cuando se necesiten)
- **TanStack Query v5** — Estado del servidor
- **React Hook Form + Zod** — Formularios con validación
- **Axios** — Cliente HTTP centralizado
- **Lucide React** — Iconos
- **Recharts** — Gráficos (admin dashboard)
- **Sonner** — Notificaciones toast

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend

# Iniciar en modo desarrollo
npm run dev

# Verificar tipos
npm run type-check

# Build de producción
npm run build
npm run start
```

La app estará disponible en `http://localhost:3000`.

## Estructura

```
frontend/
├── app/
│   ├── layout.tsx              Layout raíz
│   ├── page.tsx                Home
│   ├── globals.css             Estilos globales + variables CSS shadcn
│   ├── not-found.tsx           404
│   ├── error.tsx               Error boundary
│   ├── catalogo/page.tsx       TODO(phase-4)
│   ├── producto/[slug]/        TODO(phase-4)
│   ├── (auth)/login/           TODO(phase-1)
│   └── admin/
│       ├── page.tsx            TODO(phase-5)
│       ├── layout.tsx          Layout admin con auth guard
│       └── control-center/     TODO(phase-5) SUPER_ADMIN only
├── components/
│   ├── ui/                     shadcn/ui components
│   ├── layout/                 Header, Footer
│   ├── product/                TODO(phase-4)
│   └── admin/                  TODO(phase-5)
├── hooks/                      Custom React hooks
├── lib/
│   ├── api.ts                  Cliente Axios centralizado
│   └── utils.ts                cn(), formatPrice(), etc.
├── services/                   Llamadas a la API por módulo
└── types/
    └── index.ts                Interfaces TypeScript
```

## Variables de entorno

| Variable                              | Descripción                                          | Requerida |
|---------------------------------------|------------------------------------------------------|-----------|
| `NEXT_PUBLIC_API_BASE_URL`            | URL base del backend (/api/v1)                       | Sí        |
| `NEXT_PUBLIC_WA_NUMBER`               | Número WhatsApp de la tienda                         | No        |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`   | Cloud name de Cloudinary (cliente)                   | Para uploads |
| `CLOUDINARY_API_KEY`                  | API Key Cloudinary — **solo servidor**               | Para uploads |
| `CLOUDINARY_API_SECRET`               | API Secret Cloudinary — **solo servidor, NUNCA PUBLIC** | Para uploads |
| `CLOUDINARY_UPLOAD_FOLDER`            | Folder destino (default `stepup/products`)           | No        |

### Configurar Cloudinary

1. Crear cuenta en [cloudinary.com](https://cloudinary.com).
2. En **Dashboard** copiar `Cloud name`, `API Key` y `API Secret`.
3. Agregar las cuatro variables al servicio **FrontEnd** en Railway (o `.env.local` en desarrollo).
4. Redeploy del frontend (porque `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` se inyecta en build time).
5. Ir a `/admin/productos/nuevo` y usar **"Subir imagen"** en la sección de imágenes.

> El endpoint `/api/cloudinary/sign` firma uploads en el servidor para no exponer el `API_SECRET`. El cliente solo recibe `signature`, `timestamp`, `apiKey`, `cloudName` y `folder`.

### Eliminación de imágenes en Cloudinary

Al quitar una imagen del producto desde el admin:

- Si la imagen tiene `cloudinaryPublicId` (fue subida por el formulario), el frontend pide confirmación y llama a `POST /api/cloudinary/delete`, que firma la petición de `destroy` con el `API_SECRET` (server-side) y borra el asset real en Cloudinary.
- Si la imagen es una URL manual sin `cloudinaryPublicId`, solo se quita del producto. **No** se intenta borrar nada en el proveedor externo.
- El endpoint valida que el `publicId` esté bajo `CLOUDINARY_UPLOAD_FOLDER` (`stepup/products/`) para impedir borrar assets fuera del scope del proyecto.
- Solo roles `SUPER_ADMIN`, `OWNER`, `ADMIN` y `EDITOR` pueden eliminar. `VIEWER` recibe 403.
- Si Cloudinary responde `not found`, se trata como éxito idempotente (el asset ya no existe).

**Limitación conocida:** si subes una imagen y luego cancelas el formulario o cierras la pestaña sin eliminarla explícitamente con el botón papelera, el asset puede quedar huérfano en Cloudinary. La limpieza automática de huérfanos no está implementada en esta fase.

## Instalación de shadcn/ui

```bash
npx shadcn@latest init
# Seguir el wizard y seleccionar opciones según el proyecto

# Agregar componentes según se necesiten:
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
# etc.
```

## Páginas implementadas (Fase 0)

| Página                 | Estado   | Descripción                          |
|------------------------|----------|--------------------------------------|
| Home (`/`)             | ✅       | Placeholder con estructura base      |
| Catálogo (`/catalogo`) | ⏳       | TODO(phase-4)                        |
| Producto (`/producto/[slug]`) | ⏳ | TODO(phase-4)                       |
| Login (`/login`)       | ⏳       | TODO(phase-1)                        |
| Admin Dashboard        | ⏳       | TODO(phase-5)                        |
| Control Center         | ⏳       | TODO(phase-5) SUPER_ADMIN only       |

## Notas

- El frontend **nunca** accede directamente a PostgreSQL.
- Todas las llamadas van a través de `lib/api.ts` → backend REST.
- No usar Next.js API Routes como backend principal.
- Variables sin `NEXT_PUBLIC_` son solo del servidor y no se exponen al navegador.
