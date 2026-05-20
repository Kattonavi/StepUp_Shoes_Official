'use client'

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/services/category.service'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 min — categorías cambian poco
  })
}
