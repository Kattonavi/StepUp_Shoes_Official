import apiClient from '@/lib/api'
import type {
  ApiResponse,
  AnalyticsEventFilters,
  AnalyticsEventsSummary,
  TrackEventRequest,
  TrackEventResponse,
} from '@/types'
import type { PageResponse } from '@/types'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

/**
 * Fire-and-forget public event tracking.
 *
 * - Usa fetch nativo: NUNCA pasa por los interceptors de axios (sin refresh).
 * - Errores SIEMPRE silenciados — analytics jamás rompe la UX. Esto incluye
 *   `ERR_BLOCKED_BY_CLIENT` (adblock/extensiones), que es esperado y benigno.
 * - `keepalive: true` permite que el evento se envíe aunque la página navegue.
 * - AbortController con timeout corto evita que una petición colgada quede
 *   "pending" indefinidamente.
 * - No envía cookies (endpoint público): evita preflight innecesario y coste.
 */
export async function trackEvent(payload: TrackEventRequest): Promise<void> {
  if (typeof window === 'undefined') return

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)
  try {
    await fetch(`${API_BASE}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    })
  } catch {
    // Intentionally swallowed — analytics must never break UX (adblock, timeout…)
  } finally {
    clearTimeout(timer)
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsEventsSummary> {
  const res = await apiClient.get<ApiResponse<AnalyticsEventsSummary>>('/analytics/events/summary')
  return res.data.data!
}

export async function getAnalyticsEvents(filters: AnalyticsEventFilters = {}): Promise<PageResponse<unknown>> {
  const params = new URLSearchParams()
  if (filters.eventType) params.set('eventType', filters.eventType)
  if (filters.productSlug) params.set('productSlug', filters.productSlug)
  if (filters.categorySlug) params.set('categorySlug', filters.categorySlug)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  params.set('page', String(filters.page ?? 0))
  params.set('size', String(filters.size ?? 50))
  const res = await apiClient.get<ApiResponse<PageResponse<unknown>>>(`/analytics/events?${params}`)
  return res.data.data!
}
