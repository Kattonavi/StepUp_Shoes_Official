import { useQuery } from '@tanstack/react-query'
import { getPublicSettings } from '@/services/settings.service'

export function usePublicSettings() {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: getPublicSettings,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
