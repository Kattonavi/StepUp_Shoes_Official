import { useQuery } from '@tanstack/react-query'
import { getUnreadMessageCount } from '@/services/admin-message.service'

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: ['messages-unread-count'],
    queryFn: getUnreadMessageCount,
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
  })
}
