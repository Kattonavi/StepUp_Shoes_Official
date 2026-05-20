'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminProductById } from '@/services/admin-product.service'

export function useAdminProduct(id: string | null) {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => getAdminProductById(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}
