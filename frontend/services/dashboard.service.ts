import apiClient from '@/lib/api'
import type { ApiResponse, DashboardSummary } from '@/types'

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await apiClient.get<ApiResponse<DashboardSummary>>('/analytics/dashboard')
  const data = res.data.data
  if (!data) throw new Error('No dashboard data returned')
  return data
}
