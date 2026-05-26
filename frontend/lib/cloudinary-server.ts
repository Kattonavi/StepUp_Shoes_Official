/**
 * Helpers de servidor (Node runtime) compartidos por las routes
 * /api/cloudinary/sign y /api/cloudinary/delete.
 *
 * SECRETOS:
 *  - CLOUDINARY_API_SECRET solo se lee en este módulo y no se devuelve nunca.
 *  - El Authorization del caller se reenvía a /auth/me del backend; no se
 *    almacena ni se loggea.
 */
// IMPORTANT: this module reads CLOUDINARY_API_SECRET and MUST only be imported
// from Next.js route handlers (Node runtime). Do NOT import from any client
// component. Each consumer route handler sets `export const runtime = 'nodejs'`.

export const DEFAULT_FOLDER = 'stepup/products'
export const DEFAULT_PROMOTIONS_FOLDER = 'stepup/promotions'

/**
 * Upload "purpose" — selected by the route caller, never by the client
 * directly choosing a folder string. The server maps purpose → folder so the
 * client can't write into arbitrary Cloudinary directories.
 */
export type UploadPurpose = 'product' | 'promotion'

export type AdminRole = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'

/** Roles autorizados a tocar assets de Cloudinary. VIEWER excluido a propósito. */
export const CLOUDINARY_WRITE_ROLES: ReadonlyArray<AdminRole> = [
  'SUPER_ADMIN',
  'OWNER',
  'ADMIN',
  'EDITOR',
]

export interface CloudinaryServerConfig {
  apiKey: string
  apiSecret: string
  cloudName: string
  /** Default folder (products) — kept for backward compatibility. */
  folder: string
  /** Folder for promotion banner uploads. */
  promotionsFolder: string
}

export function getEnv(name: string): string | undefined {
  const v = process.env[name]
  return v && v.length > 0 ? v : undefined
}

/**
 * Loads the Cloudinary server config or returns null if the deployment is
 * not configured. Callers should return a 503 with a generic message.
 */
export function loadCloudinaryConfig(): CloudinaryServerConfig | null {
  const apiKey = getEnv('CLOUDINARY_API_KEY')
  const apiSecret = getEnv('CLOUDINARY_API_SECRET')
  const cloudName = getEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
  const folder = getEnv('CLOUDINARY_UPLOAD_FOLDER') ?? DEFAULT_FOLDER
  const promotionsFolder =
    getEnv('CLOUDINARY_PROMOTIONS_FOLDER') ?? DEFAULT_PROMOTIONS_FOLDER
  if (!apiKey || !apiSecret || !cloudName) return null
  return { apiKey, apiSecret, cloudName, folder, promotionsFolder }
}

/** Server-side folder selection by purpose. Client never picks the folder. */
export function pickFolder(
  config: CloudinaryServerConfig,
  purpose: UploadPurpose | undefined
): string {
  return purpose === 'promotion' ? config.promotionsFolder : config.folder
}

/** Returns the set of folders an asset can legitimately live in. */
export function allowedFolders(config: CloudinaryServerConfig): string[] {
  return [config.folder, config.promotionsFolder]
}

export type AuthCheckResult =
  | { ok: true; role: AdminRole }
  | { ok: false; status: 401 | 403; reason: string }

/**
 * Validates the caller's Authorization header against the backend's /auth/me
 * endpoint and (optionally) restricts to a set of roles.
 *
 * - 401 if missing/invalid token or backend not reachable.
 * - 403 if the user is authenticated but not in `allowedRoles`.
 * - { ok: true } otherwise.
 */
export async function requireAuthorizedUser(
  authHeader: string | null,
  allowedRoles?: ReadonlyArray<AdminRole>
): Promise<AuthCheckResult> {
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return { ok: false, status: 401, reason: 'missing_token' }
  }
  const backendBase = getEnv('NEXT_PUBLIC_API_BASE_URL')
  if (!backendBase) {
    return { ok: false, status: 401, reason: 'backend_not_configured' }
  }

  let res: Response
  try {
    res = await fetch(`${backendBase.replace(/\/+$/, '')}/auth/me`, {
      method: 'GET',
      headers: { Authorization: authHeader, Accept: 'application/json' },
      cache: 'no-store',
    })
  } catch {
    return { ok: false, status: 401, reason: 'auth_check_failed' }
  }

  if (!res.ok) {
    return { ok: false, status: 401, reason: 'invalid_token' }
  }

  // Best-effort role extraction. If the shape ever changes we still treat the
  // user as authenticated (ok) but with no role — caller decides if it's enough.
  let role: AdminRole | undefined
  try {
    const body = (await res.json()) as { data?: { role?: AdminRole } }
    role = body?.data?.role
  } catch {
    /* swallow — backend returned non-JSON; we already know status is OK */
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return { ok: false, status: 403, reason: 'forbidden_role' }
    }
  }

  return { ok: true, role: role ?? 'VIEWER' }
}

/**
 * Validates that a Cloudinary public_id is safe to operate on:
 *  - non-empty, string, reasonable length
 *  - starts with one of the allowed folder prefixes (so callers can't touch
 *    assets outside the project — stepup/products or stepup/promotions)
 *  - no traversal sequences, no URL schemes, no whitespace control chars
 *
 * `allowed` can be a single folder (backward compatible) or a list — we accept
 * the publicId if it starts with any of them followed by '/'.
 */
export function isPublicIdAllowed(
  publicId: unknown,
  allowed: string | ReadonlyArray<string>
): publicId is string {
  if (typeof publicId !== 'string') return false
  const trimmed = publicId.trim()
  if (trimmed.length === 0 || trimmed.length > 255) return false
  if (trimmed !== publicId) return false // no surrounding whitespace
  if (/\s/.test(trimmed)) return false   // no internal whitespace either
  if (trimmed.includes('..')) return false
  const lowered = trimmed.toLowerCase()
  if (
    lowered.startsWith('http://') ||
    lowered.startsWith('https://') ||
    lowered.startsWith('javascript:') ||
    lowered.startsWith('data:') ||
    lowered.startsWith('file:') ||
    lowered.startsWith('vbscript:')
  ) {
    return false
  }
  const folders = typeof allowed === 'string' ? [allowed] : allowed
  return folders.some((f) => trimmed.startsWith(`${f}/`))
}
