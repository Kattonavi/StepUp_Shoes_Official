'use client'

import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '@/services/control-center.service'
import type { AuditLogFilters } from '@/types'

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ['cc-audit-logs', filters],
    queryFn: () => getAuditLogs(filters),
    staleTime: 30_000,
  })
}
