import { useQuery } from '@tanstack/react-query'
import { getMessages } from '@/services/admin-message.service'
import type { MessageFilters } from '@/types'

export function useAdminMessages(filters: MessageFilters = {}) {
  return useQuery({
    queryKey: ['admin-messages', filters],
    queryFn: () => getMessages(filters),
    staleTime: 30_000,
  })
}
