'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getStorefrontSummary,
  getTopProducts,
  getTopCategories,
  getRecentEvents,
  getProductPerformance,
} from '@/services/admin-analytics.service'
import type { AnalyticsRange } from '@/types'

const STALE = 1000 * 30

export function useStorefrontSummary(range: AnalyticsRange) {
  return useQuery({
    queryKey: ['storefront-analytics', 'summary', range],
    queryFn: () => getStorefrontSummary(range),
    staleTime: STALE,
    refetchOnWindowFocus: false,
  })
}

export function useTopProducts(range: AnalyticsRange, by: 'views' | 'whatsapp') {
  return useQuery({
    queryKey: ['storefront-analytics', 'top-products', range, by],
    queryFn: () => getTopProducts(range, by),
    staleTime: STALE,
    refetchOnWindowFocus: false,
  })
}

export function useTopCategories(range: AnalyticsRange) {
  return useQuery({
    queryKey: ['storefront-analytics', 'top-categories', range],
    queryFn: () => getTopCategories(range),
    staleTime: STALE,
    refetchOnWindowFocus: false,
  })
}

export function useRecentEvents(range: AnalyticsRange) {
  return useQuery({
    queryKey: ['storefront-analytics', 'recent-events', range],
    queryFn: () => getRecentEvents(range),
    staleTime: STALE,
    refetchOnWindowFocus: false,
  })
}

export function useProductPerformance(range: AnalyticsRange) {
  return useQuery({
    queryKey: ['storefront-analytics', 'product-performance', range],
    queryFn: () => getProductPerformance(range),
    staleTime: STALE,
    refetchOnWindowFocus: false,
  })
}
