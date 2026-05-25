/**
 * POST /api/cloudinary/delete
 *
 * Elimina un asset de Cloudinary por public_id desde el servidor (Node runtime)
 * sin exponer el API secret.
 *
 * Body:
 *   { "publicId": "stepup/products/abc123" }
 *
 * Seguridad:
 *  - CLOUDINARY_API_SECRET solo se usa en el servidor.
 *  - Requiere Authorization válido y rol en CLOUDINARY_WRITE_ROLES.
 *  - El publicId debe estar bajo CLOUDINARY_UPLOAD_FOLDER (default
 *    `stepup/products/`). Esto impide borrar assets fuera del scope del
 *    proyecto incluso si el cliente envía algo malicioso.
 *  - No se devuelve api_secret en ningún caso.
 *  - El cuerpo no se loggea (solo el publicId, sin tokens).
 *
 * Respuestas:
 *  - 200 { success: true, status: 'deleted' | 'not_found' } — siempre que el
 *    asset ya no exista en Cloudinary (idempotente).
 *  - 400 si publicId es inválido o no pertenece al folder permitido.
 *  - 401/403 según validación de sesión y rol.
 *  - 503 si Cloudinary no está configurado.
 *  - 502 si Cloudinary respondió con error inesperado.
 */
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import {
  CLOUDINARY_WRITE_ROLES,
  isPublicIdAllowed,
  loadCloudinaryConfig,
  requireAuthorizedUser,
} from '@/lib/cloudinary-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface DeleteBody {
  publicId?: unknown
}

export async function POST(request: Request) {
  const config = loadCloudinaryConfig()
  if (!config) {
    return NextResponse.json(
      {
        success: false,
        message: 'Cloudinary no está configurado correctamente.',
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
            ? 'Tu rol no permite eliminar imágenes.'
            : 'Tu sesión expiró. Inicia sesión nuevamente.',
      },
      { status: auth.status }
    )
  }

  let body: DeleteBody
  try {
    body = (await request.json()) as DeleteBody
  } catch {
    return NextResponse.json(
      { success: false, message: 'Body inválido.' },
      { status: 400 }
    )
  }

  if (!isPublicIdAllowed(body.publicId, config.folder)) {
    return NextResponse.json(
      {
        success: false,
        message: `publicId inválido o fuera del folder permitido (${config.folder}/).`,
      },
      { status: 400 }
    )
  }

  const publicId = body.publicId
  const timestamp = Math.floor(Date.now() / 1000)

  // Firma para Cloudinary destroy: SHA-1(public_id=...&timestamp=... + secret).
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`
  const signature = createHash('sha1')
    .update(paramsToSign + config.apiSecret)
    .digest('hex')

  const form = new URLSearchParams()
  form.set('public_id', publicId)
  form.set('timestamp', String(timestamp))
  form.set('api_key', config.apiKey)
  form.set('signature', signature)
  // invalidate=true → purga el asset también de la CDN edge de Cloudinary.
  form.set('invalidate', 'true')

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`

  let res: Response
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'No pudimos contactar a Cloudinary.' },
      { status: 502 }
    )
  }

  let data: { result?: string } = {}
  try {
    data = (await res.json()) as { result?: string }
  } catch {
    /* Cloudinary always returns JSON for destroy; tolerar igualmente */
  }

  // Cloudinary devuelve `result`: "ok" | "not found" | otros mensajes de error.
  if (data.result === 'ok') {
    console.info(`Cloudinary asset deleted: ${publicId}`)
    return NextResponse.json(
      { success: true, status: 'deleted' },
      { status: 200 }
    )
  }
  if (data.result === 'not found') {
    // Trato idempotente — el asset ya no existe, el cliente puede quitarlo.
    console.info(`Cloudinary asset already gone: ${publicId}`)
    return NextResponse.json(
      { success: true, status: 'not_found' },
      { status: 200 }
    )
  }

  // No exponer detalles internos de Cloudinary al cliente.
  console.warn(
    `Cloudinary destroy failed for ${publicId} — http=${res.status} result=${data.result ?? 'unknown'}`
  )
  return NextResponse.json(
    {
      success: false,
      message: 'No pudimos eliminar la imagen de Cloudinary. Intenta nuevamente.',
    },
    { status: 502 }
  )
}
