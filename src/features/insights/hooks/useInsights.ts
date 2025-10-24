/**
 * Insights Hooks
 */
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/config/queryClient'
import { getMonthlyInsights, getTrends, getAnomalies } from '../api/insightsApi'

/**
 * Get monthly insights
 */
export function useMonthlyInsights(month?: string) {
  return useQuery({
    queryKey: queryKeys.insights.monthly(month),
    queryFn: () => getMonthlyInsights(month),
  })
}

/**
 * Get spending trends
 */
export function useTrends(params?: { months?: number; category?: string }) {
  return useQuery({
    queryKey: queryKeys.insights.trends(params),
    queryFn: () => getTrends(params),
  })
}

/**
 * Get anomalies
 */
export function useAnomalies(params?: { days?: number; threshold?: number }) {
  return useQuery({
    queryKey: queryKeys.insights.anomalies(params),
    queryFn: () => getAnomalies(params),
  })
}
