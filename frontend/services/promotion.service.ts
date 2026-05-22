import { serverGet } from '@/lib/server-api'
import type { ApiResponse, Promotion } from '@/types'

export async function getPublicPromotions(): Promise<Promotion[]> {
  const data = await serverGet<Promotion[]>('/public/promotions')
  return data ?? []
}
