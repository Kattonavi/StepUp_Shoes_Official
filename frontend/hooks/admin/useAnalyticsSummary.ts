import { useQuery } from '@tanstack/react-query'
import { getAnalyticsSummary } from '@/services/analytics.service'

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics-summary'],
    queryFn: getAnalyticsSummary,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
