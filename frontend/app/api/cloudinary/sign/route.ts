/**
 * POST /api/cloudinary/sign
 *
 * Genera una firma temporal para subir imágenes a Cloudinary desde el cliente
 * sin exponer el API secret. Solo firma `folder` y `timestamp` para que el
 * cliente NO pueda cambiar el folder ni inyectar public_id arbitrarios.
 *
 * Seguridad:
 *  - CLOUDINARY_API_SECRET solo vive en el servidor (Node runtime).
 *  - Si el caller envía Authorization: Bearer <accessToken>, se valida contra
 *    el backend (/auth/me). Si la validación falla, devolvemos 401.
 *  - Si no hay Authorization, no firmamos (devolvemos 401). Esto evita que
 *    cualquier visitante anónimo pueda usar nuestro endpoint para subir.
 */
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_FOLDER = 'stepup/products'

function getEnv(name: string): string | undefined {
  const v = process.env[name]
  return v && v.length > 0 ? v : undefined
}

async function isAuthorized(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return false
  }
  const backendBase = getEnv('NEXT_PUBLIC_API_BASE_URL')
  if (!backendBase) return false
  try {
    const res = await fetch(`${backendBase.replace(/\/+$/, '')}/auth/me`, {
      method: 'GET',
      headers: { Authorization: authHeader, Accept: 'application/json' },
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const apiKey = getEnv('CLOUDINARY_API_KEY')
  const apiSecret = getEnv('CLOUDINARY_API_SECRET')
  const cloudName = getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
  const folder = getEnv('CLOUDINARY_UPLOAD_FOLDER') ?? DEFAULT_FOLDER

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json(
      {
        success: false,
        message:
          'Cloudinary no está configurado en el servidor. Falta CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET o NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.',
      },
      { status: 503 }
    )
  }

  const ok = await isAuthorized(request.headers.get('authorization'))
  if (!ok) {
    return NextResponse.json(
      { success: false, message: 'No autorizado para firmar uploads.' },
      { status: 401 }
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)

  // Cloudinary signature: SHA-1(paramsToSign_sorted_join('&') + api_secret).
  // Only sign `folder` and `timestamp` — el cliente NO puede modificar otros
  // params firmados ni inyectar public_id sin invalidar la firma.
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex')

  return NextResponse.json(
    {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    },
    { status: 200 }
  )
}
