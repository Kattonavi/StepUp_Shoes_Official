'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminUsers } from '@/services/admin-user.service'
import type { AdminUserFilters } from '@/types'

export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => getAdminUsers(filters),
    staleTime: 30_000,
  })
}
