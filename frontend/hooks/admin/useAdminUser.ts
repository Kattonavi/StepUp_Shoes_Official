'use client'

import { useQuery } from '@tanstack/react-query'
import { getAdminUser } from '@/services/admin-user.service'

export function useAdminUser(id: string | null) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => getAdminUser(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}
