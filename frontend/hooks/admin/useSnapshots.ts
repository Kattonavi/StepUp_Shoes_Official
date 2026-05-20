'use client'

import { useQuery } from '@tanstack/react-query'
import { getSnapshots } from '@/services/control-center.service'
import type { SnapshotFilters } from '@/types'

export function useSnapshots(filters?: SnapshotFilters) {
  return useQuery({
    queryKey: ['cc-snapshots', filters],
    queryFn: () => getSnapshots(filters),
    staleTime: 30_000,
  })
}
