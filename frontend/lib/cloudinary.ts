/**
 * Cloudinary upload helper — pide firma al backend Java y sube el archivo
 * directamente a Cloudinary desde el navegador.
 *
 * IMPORTANTE: firma y borrado ya NO viven en rutas Next del frontend, porque
 * frontend y backend están en dominios distintos en Railway y el navegador
 * NO envía las cookies del backend a una API route del frontend. Las rutas
 * están en el backend (POST /api/v1/cloudinary/sign y /delete), que ya valida
 * la sesión vía cookie httpOnly + rol.
 *
 * Reglas de seguridad / UX:
 *  - Validamos tipo y tamaño en el cliente antes de subir.
 *  - No permitimos SVG (riesgo XSS).
 *  - No permitimos data:/javascript:/file:/vbscript: como input manual; ese
 *    chequeo se hace aparte en isSafeUrl (lib/url-validation).
 *  - El api_secret JAMÁS toca el navegador — vive solo en el backend.
 *  - `credentials: 'include'` envía las cookies httpOnly de sesión al backend.
 */

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

interface ApiEnvelope<T> {
  success?: boolean
  data?: T | null
  message?: string | null
}

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
    | 'forbidden'
    | 'invalid_public_id'
    | 'delete_failed'

  constructor(
    code: CloudinaryUploadError['code'],
    message: string
  ) {
    super(message)
    this.code = code
    this.name = 'CloudinaryUploadError'
  }
}

export type DeleteAssetResult = 'deleted' | 'not_found'

/**
 * Subir a qué carpeta lógica de Cloudinary. El servidor mapea el purpose al
 * folder real — el cliente nunca elige el nombre del folder.
 */
export type UploadPurpose = 'product' | 'promotion'

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

export async function getCloudinarySignature(
  purpose: UploadPurpose = 'product'
): Promise<SignatureResponse> {
  let res: Response
  try {
    res = await fetch(`${BACKEND_BASE_URL}/cloudinary/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ purpose }),
    })
  } catch {
    throw new CloudinaryUploadError(
      'sign_failed',
      'No pudimos preparar la subida. Verifica tu conexión.'
    )
  }

  if (res.status === 401) {
    throw new CloudinaryUploadError(
      'unauthorized',
      'Tu sesión expiró. Vuelve a iniciar sesión para subir imágenes.'
    )
  }
  if (res.status === 403) {
    throw new CloudinaryUploadError(
      'forbidden',
      'Tu rol no permite subir imágenes.'
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

  // El backend envuelve la respuesta en ApiResponse { success, data, ... }.
  const body = (await res.json()) as ApiEnvelope<SignatureResponse>
  if (!body.success || !body.data) {
    throw new CloudinaryUploadError(
      'sign_failed',
      body.message ?? 'No pudimos preparar la subida.'
    )
  }
  return body.data
}

/**
 * Sube un archivo a Cloudinary con firma segura. El `purpose` decide el
 * folder server-side ('product' → stepup/products, 'promotion' → stepup/promotions).
 * Lanza CloudinaryUploadError con `.code` legible en caso de fallo.
 */
export async function uploadImage(
  file: File,
  purpose: UploadPurpose = 'product'
): Promise<UploadedImage> {
  validateImageFile(file)

  const sig = await getCloudinarySignature(purpose)

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

/** Backward-compatible alias for the existing product uploader. */
export function uploadProductImage(file: File): Promise<UploadedImage> {
  return uploadImage(file, 'product')
}

/**
 * Elimina un asset de Cloudinary por public_id llamando al backend
 * `POST /api/v1/cloudinary/delete` (firma la petición con el API secret).
 *
 * - Si el asset existía y se eliminó → resuelve con `'deleted'`.
 * - Si Cloudinary respondió "not found" → resuelve con `'not_found'`
 *   (idempotente: el cliente puede tratarlo como éxito y quitar la imagen).
 * - En cualquier otro caso lanza CloudinaryUploadError con `.code` significativo.
 *
 * El api_secret jamás llega al cliente.
 */
export async function deleteCloudinaryAsset(
  publicId: string
): Promise<DeleteAssetResult> {
  if (!publicId || typeof publicId !== 'string') {
    throw new CloudinaryUploadError(
      'invalid_public_id',
      'No se proporcionó un identificador de imagen válido.'
    )
  }

  let res: Response
  try {
    res = await fetch(`${BACKEND_BASE_URL}/cloudinary/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ publicId }),
    })
  } catch {
    throw new CloudinaryUploadError(
      'delete_failed',
      'No pudimos eliminar la imagen de Cloudinary. Verifica tu conexión e intenta nuevamente.'
    )
  }

  if (res.status === 401) {
    throw new CloudinaryUploadError(
      'unauthorized',
      'Tu sesión expiró. Inicia sesión nuevamente.'
    )
  }
  if (res.status === 403) {
    throw new CloudinaryUploadError(
      'forbidden',
      'Tu rol no permite eliminar imágenes.'
    )
  }
  if (res.status === 503) {
    throw new CloudinaryUploadError(
      'not_configured',
      'Cloudinary no está configurado correctamente.'
    )
  }
  if (res.status === 400) {
    throw new CloudinaryUploadError(
      'invalid_public_id',
      'La imagen no se puede eliminar desde aquí.'
    )
  }

  // Backend devuelve ApiResponse { success, data: { status: 'deleted'|'not_found' } }.
  let body: ApiEnvelope<{ status?: DeleteAssetResult }> = {}
  try {
    body = (await res.json()) as ApiEnvelope<{ status?: DeleteAssetResult }>
  } catch {
    /* fallthrough — manejamos como error abajo */
  }

  if (!res.ok || !body.success) {
    throw new CloudinaryUploadError(
      'delete_failed',
      body.message ?? 'No pudimos eliminar la imagen de Cloudinary. Intenta nuevamente.'
    )
  }

  return body.data?.status === 'not_found' ? 'not_found' : 'deleted'
}
