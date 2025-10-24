/**
 * Hook for fetching expenses list with pagination
 */
import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/shared/config/queryClient'
import { getExpenses } from '../api/expenseApi'

interface UseExpensesParams {
  month?: string
  category?: string
  pageSize?: number
}

export function useExpenses(params?: UseExpensesParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: ({ pageParam = 1 }) =>
      getExpenses({
        ...params,
        page: pageParam,
        pageSize: params?.pageSize || 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.expenses || !Array.isArray(lastPage.expenses)) {
        return undefined
      }
      const hasMore = lastPage.expenses.length === (params?.pageSize || 20)
      return hasMore ? lastPage.page + 1 : undefined
    },
  })
}
