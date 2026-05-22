'use client'

import { useQuery } from '@tanstack/react-query'
import { listPromotions } from '@/services/admin-promotion.service'

export function useAdminPromotions() {
  return useQuery({
    queryKey: ['admin-promotions'],
    queryFn: listPromotions,
    staleTime: 30_000,
  })
}
