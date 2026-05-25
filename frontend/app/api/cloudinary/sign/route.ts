/**
 * POST /api/cloudinary/sign
 *
 * Genera una firma temporal para subir imágenes a Cloudinary desde el cliente
 * sin exponer el API secret. Solo firma `folder` y `timestamp` para que el
 * cliente NO pueda cambiar el folder ni inyectar public_id arbitrarios.
 *
 * Seguridad:
 *  - CLOUDINARY_API_SECRET solo vive en el servidor (Node runtime).
 *  - Requiere Authorization: Bearer <accessToken> y rol con permiso de
 *    escritura sobre productos (SUPER_ADMIN/OWNER/ADMIN/EDITOR). VIEWER no
 *    puede pedir firmas.
 */
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import {
  CLOUDINARY_WRITE_ROLES,
  loadCloudinaryConfig,
  requireAuthorizedUser,
} from '@/lib/cloudinary-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

  const timestamp = Math.floor(Date.now() / 1000)

  // Cloudinary signature: SHA-1(paramsToSign_sorted_join('&') + api_secret).
  // Only sign `folder` and `timestamp` — el cliente NO puede modificar otros
  // params firmados ni inyectar public_id sin invalidar la firma.
  const paramsToSign = `folder=${config.folder}&timestamp=${timestamp}`
  const signature = createHash('sha1')
    .update(paramsToSign + config.apiSecret)
    .digest('hex')

  return NextResponse.json(
    {
      signature,
      timestamp,
      apiKey: config.apiKey,
      cloudName: config.cloudName,
      folder: config.folder,
    },
    { status: 200 }
  )
}
