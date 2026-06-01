'use client'

import { useEffect } from 'react'
import { trackStorefrontEvent } from '@/services/storefront-event.service'
import type { StorefrontEventPayload, StorefrontEventType } from '@/types'

type TrackPageViewProps = Omit<StorefrontEventPayload, 'eventType'> & {
  eventType: StorefrontEventType
}

/**
 * Dispara un evento del storefront (Fase L) al montar. Renderiza nada.
 * Usa el endpoint /storefront-events (resistente a adblock), fire-and-forget.
 */
export default function TrackPageView({ eventType, ...rest }: TrackPageViewProps) {
  useEffect(() => {
    trackStorefrontEvent({
      eventType,
      sourcePage:
        rest.sourcePage ??
        (typeof window !== 'undefined' ? window.location.pathname : undefined),
      ...rest,
    })
    // Fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
