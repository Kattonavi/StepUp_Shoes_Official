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
 * Uses plain fetch so it never throws through the axios interceptors.
 * Errors are swallowed — analytics must never break UX.
 */
export async function trackEvent(payload: TrackEventRequest): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    await fetch(`${API_BASE}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Intentionally swallowed — analytics must never break UX
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
