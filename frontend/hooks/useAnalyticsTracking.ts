'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/services/analytics.service'
import { getSessionId } from '@/lib/analytics-session'
import type { AnalyticsEventType, TrackEventRequest } from '@/types'

export function useAnalyticsTracking() {
  const pathname = usePathname()

  const track = useCallback(
    (eventType: AnalyticsEventType, extra?: Partial<TrackEventRequest>) => {
      const referrer = typeof document !== 'undefined' ? document.referrer : undefined
      trackEvent({
        eventType,
        path: extra?.path ?? pathname,
        referrer: referrer || undefined,
        sessionId: getSessionId(),
        ...extra,
      })
    },
    [pathname]
  )

  return { track }
}
