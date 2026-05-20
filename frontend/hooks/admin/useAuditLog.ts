'use client'

import { useQuery } from '@tanstack/react-query'
import { getAuditLog } from '@/services/control-center.service'

export function useAuditLog(id: string | null) {
  return useQuery({
    queryKey: ['cc-audit-log', id],
    queryFn: () => getAuditLog(id!),
    enabled: !!id,
    staleTime: 60_000,
  })
}
