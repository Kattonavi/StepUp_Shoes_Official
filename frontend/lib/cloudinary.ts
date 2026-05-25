/**
 * Cloudinary upload helper — usa firma generada en /api/cloudinary/sign
 * y sube el archivo directamente a Cloudinary desde el navegador.
 *
 * Reglas de seguridad / UX:
 *  - Validamos tipo y tamaño en el cliente antes de subir.
 *  - No permitimos SVG (riesgo XSS).
 *  - No permitimos data:/javascript:/file:/vbscript: como input manual; ese
 *    chequeo se hace aparte en isSafeUrl (lib/url-validation).
 *  - El api_secret nunca toca el navegador.
 */
import { getAccessToken } from './auth-storage'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
export const ACCEPTED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export type AcceptedImageMime = (typeof ACCEPTED_IMAGE_MIME)[number]

export interface UploadedImage {
  url: string
  publicId: string
  width?: number
  height?: number
  bytes?: number
  format?: string
}

export class CloudinaryUploadError extends Error {
  readonly code:
    | 'invalid_type'
    | 'too_large'
    | 'sign_failed'
    | 'upload_failed'
    | 'not_configured'
    | 'unauthorized'

  constructor(
    code: CloudinaryUploadError['code'],
    message: string
  ) {
    super(message)
    this.code = code
    this.name = 'CloudinaryUploadError'
  }
}

export function validateImageFile(file: File): void {
  if (!file) {
    throw new CloudinaryUploadError('invalid_type', 'No se seleccionó archivo.')
  }
  const type = (file.type || '').toLowerCase()
  if (!ACCEPTED_IMAGE_MIME.includes(type as AcceptedImageMime)) {
    throw new CloudinaryUploadError(
      'invalid_type',
      'Solo se permiten imágenes JPG, PNG, WebP o AVIF.'
    )
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new CloudinaryUploadError(
      'too_large',
      'El archivo es demasiado pesado. Máximo 5 MB.'
    )
  }
}

interface SignatureResponse {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
}

export async function getCloudinarySignature(): Promise<SignatureResponse> {
  const token = getAccessToken()
  const res = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (res.status === 401) {
    throw new CloudinaryUploadError(
      'unauthorized',
      'Tu sesión expiró. Vuelve a iniciar sesión para subir imágenes.'
    )
  }
  if (res.status === 503) {
    throw new CloudinaryUploadError(
      'not_configured',
      'Cloudinary no está configurado. Avisa al equipo técnico.'
    )
  }
  if (!res.ok) {
    throw new CloudinaryUploadError(
      'sign_failed',
      'No pudimos preparar la subida. Intenta nuevamente.'
    )
  }

  return (await res.json()) as SignatureResponse
}

/**
 * Sube un archivo a Cloudinary con firma segura.
 * Lanza CloudinaryUploadError con `.code` legible en caso de fallo.
 */
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  validateImageFile(file)

  const sig = await getCloudinarySignature()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', sig.apiKey)
  formData.append('timestamp', String(sig.timestamp))
  formData.append('signature', sig.signature)
  formData.append('folder', sig.folder)

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/image/upload`

  let res: Response
  try {
    res = await fetch(endpoint, { method: 'POST', body: formData })
  } catch {
    throw new CloudinaryUploadError(
      'upload_failed',
      'No pudimos subir la imagen. Verifica tu conexión e intenta nuevamente.'
    )
  }

  if (!res.ok) {
    throw new CloudinaryUploadError(
      'upload_failed',
      'No pudimos subir la imagen. Intenta nuevamente.'
    )
  }

  const data = (await res.json()) as {
    secure_url?: string
    public_id?: string
    width?: number
    height?: number
    bytes?: number
    format?: string
  }

  if (!data.secure_url || !data.public_id) {
    throw new CloudinaryUploadError(
      'upload_failed',
      'Cloudinary devolvió una respuesta inesperada.'
    )
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    format: data.format,
  }
}
