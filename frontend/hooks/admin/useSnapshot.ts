'use client'

import { useQuery } from '@tanstack/react-query'
import { getSnapshot } from '@/services/control-center.service'

export function useSnapshot(id: string | null) {
  return useQuery({
    queryKey: ['cc-snapshot', id],
    queryFn: () => getSnapshot(id!),
    enabled: !!id,
    staleTime: 60_000,
  })
}
