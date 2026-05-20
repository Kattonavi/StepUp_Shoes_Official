'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/services/analytics.service'
import { getSessionId } from '@/lib/analytics-session'
import type { AnalyticsEventType, TrackEventRequest } from '@/types'

interface TrackPageViewProps extends Partial<TrackEventRequest> {
  eventType: AnalyticsEventType
}

/**
 * Drop this into any Server Component page to fire a client-side analytics event on mount.
 * Renders nothing — pure side effect.
 */
export default function TrackPageView({ eventType, ...rest }: TrackPageViewProps) {
  useEffect(() => {
    const path = rest.path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined)
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined
    trackEvent({
      eventType,
      path,
      referrer: referrer || undefined,
      sessionId: getSessionId(),
      ...rest,
    })
    // Fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
