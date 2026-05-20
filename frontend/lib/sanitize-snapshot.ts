/**
 * Sanitizes snapshot JSON data before displaying in the UI.
 * Redacts known sensitive fields to avoid accidental exposure.
 */

const SENSITIVE_KEYS = [
  'passwordhash',
  'password',
  'token',
  'refreshtoken',
  'accesstoken',
  'secret',
  'jwt',
  'hash',
  'apikey',
  'privatekey',
]

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase()
  return SENSITIVE_KEYS.some((k) => lower.includes(k))
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (isSensitiveKey(key)) return [key, '[REDACTED]']
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        return [key, sanitizeObject(value as Record<string, unknown>)]
      }
      return [key, value]
    })
  )
}

/**
 * Parses a JSON string from a snapshot and sanitizes sensitive fields.
 * Returns null if the input is null or invalid JSON.
 */
export function parseAndSanitizeSnapshot(
  jsonString: string | null
): Record<string, unknown> | null {
  if (!jsonString) return null

  try {
    const parsed = JSON.parse(jsonString) as Record<string, unknown>
    return sanitizeObject(parsed)
  } catch {
    return null
  }
}

/**
 * Converts a sanitized object to a pretty-printed JSON string for display.
 */
export function prettyPrintSnapshot(
  data: Record<string, unknown> | null
): string {
  if (!data) return ''
  return JSON.stringify(data, null, 2)
}
