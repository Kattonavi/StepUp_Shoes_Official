/**
 * Servicios admin de analytics del storefront (Fase L).
 * Usa el cliente Axios protegido (cookies httpOnly). Requiere sesión.
 */
import api from '@/lib/api'
import type {
  ApiResponse,
  AnalyticsRange,
  StorefrontAnalyticsSummary,
  StorefrontProductPerformance,
  StorefrontRecentEvent,
  StorefrontTopCategory,
  StorefrontTopProduct,
} from '@/types'

const BASE = '/admin/analytics'

export async function getStorefrontSummary(
  range: AnalyticsRange
): Promise<StorefrontAnalyticsSummary> {
  const res = await api.get<ApiResponse<StorefrontAnalyticsSummary>>(
    `${BASE}/summary`,
    { params: { range } }
  )
  return res.data.data!
}

export async function getTopProducts(
  range: AnalyticsRange,
  by: 'views' | 'whatsapp' = 'views'
): Promise<StorefrontTopProduct[]> {
  const res = await api.get<ApiResponse<StorefrontTopProduct[]>>(
    `${BASE}/top-products`,
    { params: { range, by } }
  )
  return res.data.data ?? []
}

export async function getTopCategories(
  range: AnalyticsRange
): Promise<StorefrontTopCategory[]> {
  const res = await api.get<ApiResponse<StorefrontTopCategory[]>>(
    `${BASE}/top-categories`,
    { params: { range } }
  )
  return res.data.data ?? []
}

export async function getRecentEvents(
  range: AnalyticsRange
): Promise<StorefrontRecentEvent[]> {
  const res = await api.get<ApiResponse<StorefrontRecentEvent[]>>(
    `${BASE}/recent-events`,
    { params: { range } }
  )
  return res.data.data ?? []
}

export async function getProductPerformance(
  range: AnalyticsRange
): Promise<StorefrontProductPerformance[]> {
  const res = await api.get<ApiResponse<StorefrontProductPerformance[]>>(
    `${BASE}/product-performance`,
    { params: { range } }
  )
  return res.data.data ?? []
}
