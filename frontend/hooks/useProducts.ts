'use client'

import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/services/product.service'
import type { ProductFilters } from '@/types'

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60, // 1 min
  })
}
