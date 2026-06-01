/**
 * Tracking de eventos del storefront (Fase L).
 *
 * - Endpoint: ${NEXT_PUBLIC_API_BASE_URL}/storefront-events
 *   Nombre resistente a adblock (a diferencia de /analytics/events).
 * - fetch nativo: NUNCA pasa por el interceptor de refresh de axios.
 * - Fire-and-forget: si falla, se ignora silenciosamente. Nunca rompe la UX,
 *   nunca bloquea navegación ni el click a WhatsApp.
 * - `keepalive` permite enviar el evento aunque la página navegue.
 * - AbortController con timeout corto evita peticiones colgadas.
 * - Sin cookies (endpoint público) → sin preflight innecesario.
 */
import { getSessionId } from '@/lib/analytics-session'
import type { StorefrontEventPayload } from '@/types'

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

export function trackStorefrontEvent(payload: StorefrontEventPayload): void {
  if (typeof window === 'undefined') return

  const body: StorefrontEventPayload = {
    ...payload,
    sessionId: payload.sessionId ?? getSessionId() ?? null,
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 4000)

  // No await — fire and forget. Cualquier error se traga.
  fetch(`${API_BASE}/storefront-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
    signal: controller.signal,
  })
    .catch(() => {
      /* swallow — adblock, timeout, red caída: el tracking jamás afecta la UX */
    })
    .finally(() => clearTimeout(timer))
}
