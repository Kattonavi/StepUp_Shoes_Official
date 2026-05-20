'use client'

import { useQuery } from '@tanstack/react-query'
import { getDeletedItems } from '@/services/control-center.service'
import type { DeletedItemFilters } from '@/types'

export function useDeletedItems(filters?: DeletedItemFilters) {
  return useQuery({
    queryKey: ['cc-deleted-items', filters],
    queryFn: () => getDeletedItems(filters),
    staleTime: 30_000,
  })
}
