/**
 * Safe URL helpers — mirror the backend SafeUrlValidator.
 *
 * Accepted:
 *   - empty string (skipped here; combine with required checks if needed)
 *   - internal path starting with "/"
 *   - http:// or https:// absolute URL
 *
 * Rejected (stored-XSS / open-redirect vectors):
 *   - javascript:, data:, vbscript:, file:, blob:, about:
 *   - protocol-relative ("//host/path")
 */

export const SAFE_URL_MESSAGE =
  'La URL debe ser una ruta interna (que empiece por /) o una URL http/https válida.'

export function isSafeUrl(value: string | null | undefined): boolean {
  if (value == null) return true
  const trimmed = value.trim()
  if (trimmed.length === 0) return true

  // Protocol-relative — reject
  if (trimmed.startsWith('//')) return false

  // Internal path
  if (trimmed.startsWith('/')) return true

  // Anything else must parse as http(s)
  try {
    const url = new URL(trimmed)
    return (url.protocol === 'http:' || url.protocol === 'https:') && !!url.host
  } catch {
    return false
  }
}
