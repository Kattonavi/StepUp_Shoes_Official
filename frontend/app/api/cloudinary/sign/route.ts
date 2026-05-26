/**
 * POST /api/cloudinary/sign
 *
 * Genera una firma temporal para subir imágenes a Cloudinary desde el cliente
 * sin exponer el API secret. Solo firma `folder` y `timestamp` para que el
 * cliente NO pueda cambiar el folder ni inyectar public_id arbitrarios.
 *
 * Body opcional:
 *   { "purpose": "product" | "promotion" }
 * Si se omite, el folder de productos. El cliente NO elige el folder
 * directamente: solo el "purpose", que el servidor mapea contra una whitelist.
 *
 * Seguridad:
 *  - CLOUDINARY_API_SECRET solo vive en el servidor (Node runtime).
 *  - Requiere Authorization: Bearer <accessToken> y rol con permiso de
 *    escritura (SUPER_ADMIN/OWNER/ADMIN/EDITOR). VIEWER → 403.
 */
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import {
  CLOUDINARY_WRITE_ROLES,
  loadCloudinaryConfig,
  pickFolder,
  requireAuthorizedUser,
  type UploadPurpose,
} from '@/lib/cloudinary-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SignBody {
  purpose?: unknown
}

function parsePurpose(value: unknown): UploadPurpose | undefined {
  if (value === 'product' || value === 'promotion') return value
  return undefined
}

export async function POST(request: Request) {
  const config = loadCloudinaryConfig()
  if (!config) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Cloudinary no está configurado en el servidor. Falta CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET o NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.',
      },
      { status: 503 }
    )
  }

  const auth = await requireAuthorizedUser(
    request.headers.get('authorization'),
    CLOUDINARY_WRITE_ROLES
  )
  if (!auth.ok) {
    return NextResponse.json(
      {
        success: false,
        message:
          auth.status === 403
            ? 'Tu rol no permite subir imágenes.'
            : 'No autorizado para firmar uploads.',
      },
      { status: auth.status }
    )
  }

  // Body is optional (GET-like usage from older callers still works).
  let purpose: UploadPurpose | undefined
  try {
    const body = (await request.json()) as SignBody
    purpose = parsePurpose(body.purpose)
  } catch {
    /* empty body — fall back to default purpose */
  }

  const folder = pickFolder(config, purpose)
  const timestamp = Math.floor(Date.now() / 1000)

  // Cloudinary signature: SHA-1(paramsToSign_sorted_join('&') + api_secret).
  // Sign only `folder` and `timestamp` — el cliente NO puede modificar otros
  // params firmados ni inyectar public_id sin invalidar la firma.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = createHash('sha1')
    .update(paramsToSign + config.apiSecret)
    .digest('hex')

  return NextResponse.json(
    {
      signature,
      timestamp,
      apiKey: config.apiKey,
      cloudName: config.cloudName,
      folder,
    },
    { status: 200 }
  )
}
