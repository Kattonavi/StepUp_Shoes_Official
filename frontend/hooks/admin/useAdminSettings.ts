import { useQuery } from '@tanstack/react-query'
import { getAdminSettings } from '@/services/settings.service'

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: getAdminSettings,
    staleTime: 30_000,
  })
}
