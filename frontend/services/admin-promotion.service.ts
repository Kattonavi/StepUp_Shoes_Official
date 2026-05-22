import api from '@/lib/api'
import type { ApiResponse, Promotion, CreatePromotionRequest, UpdatePromotionRequest } from '@/types'

const BASE = '/promotions'

export async function listPromotions(): Promise<Promotion[]> {
  const res = await api.get<ApiResponse<Promotion[]>>(BASE)
  return res.data.data ?? []
}

export async function getPromotion(id: string): Promise<Promotion> {
  const res = await api.get<ApiResponse<Promotion>>(`${BASE}/${id}`)
  return res.data.data!
}

export async function createPromotion(data: CreatePromotionRequest): Promise<Promotion> {
  const res = await api.post<ApiResponse<Promotion>>(BASE, data)
  return res.data.data!
}

export async function updatePromotion(id: string, data: UpdatePromotionRequest): Promise<Promotion> {
  const res = await api.put<ApiResponse<Promotion>>(`${BASE}/${id}`, data)
  return res.data.data!
}

export async function togglePromotionActive(id: string, active: boolean): Promise<Promotion> {
  const res = await api.patch<ApiResponse<Promotion>>(`${BASE}/${id}/status`, { active })
  return res.data.data!
}

export async function deletePromotion(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`)
}
