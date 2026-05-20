'use client'

import { useQuery } from '@tanstack/react-query'
import { getRestoreActions } from '@/services/control-center.service'

export function useRestoreActions(filters?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['cc-restore-actions', filters],
    queryFn: () => getRestoreActions(filters),
    staleTime: 30_000,
  })
}
