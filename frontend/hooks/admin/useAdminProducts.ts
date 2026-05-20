'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminProducts } from '@/services/admin-product.service'
import type { AdminProductFilters } from '@/types'

export function useAdminProducts(filters?: AdminProductFilters) {
  return useQuery({
    queryKey: ['admin-products', filters],
    queryFn: () => getAdminProducts(filters),
    staleTime: 30_000,
  })
}
