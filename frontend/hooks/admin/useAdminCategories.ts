'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminCategories } from '@/services/admin-category.service'
import type { AdminCategoryFilters } from '@/types'

export function useAdminCategories(filters?: AdminCategoryFilters) {
  return useQuery({
    queryKey: ['admin-categories', filters],
    queryFn: () => getAdminCategories(filters),
    staleTime: 30_000,
  })
}
