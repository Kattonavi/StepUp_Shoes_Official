/**
 * Utilidad de fetch para Server Components de Next.js.
 * Usa native fetch con caché de Next.js (revalidate).
 * No depende del cliente axios (solo browser/Node neutral).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

interface FetchOptions {
  /** Segundos para revalidar el caché de Next.js. Default: 60 */
  revalidate?: number
  /** Si true, no cachea (siempre fresco) */
  noCache?: boolean
}

/**
 * Hace un GET al backend desde un Server Component.
 * Devuelve el `data` del ApiResponse, o `null` si hay cualquier error.
 */
export async function serverGet<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const url = new URL(`${API_BASE_URL}${path}`)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const cacheControl: RequestInit['next'] = options.noCache
      ? { revalidate: 0 }
      : { revalidate: options.revalidate ?? 60 }

    const res = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
      next: cacheControl,
    })

    if (!res.ok) return null

    const json = await res.json()

    if (!json.success || json.data === null || json.data === undefined) {
      return null
    }

    return json.data as T
  } catch {
    return null
  }
}
