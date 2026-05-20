import { useQuery } from '@tanstack/react-query'
import { getMessage } from '@/services/admin-message.service'

export function useAdminMessage(id: string) {
  return useQuery({
    queryKey: ['admin-message', id],
    queryFn: () => getMessage(id),
    staleTime: 30_000,
    enabled: !!id,
  })
}
