/**
 * React Query Configuration
 */
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

/**
 * Query Keys Factory
 * Centralized query keys for type safety and consistency
 */
export const queryKeys = {
  expenses: {
    all: ['expenses'] as const,
    list: (filters?: Record<string, any>) => ['expenses', 'list', filters] as const,
    detail: (id: string) => ['expenses', 'detail', id] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    list: (filters?: Record<string, any>) => ['subscriptions', 'list', filters] as const,
    detail: (id: string) => ['subscriptions', 'detail', id] as const,
    summary: () => ['subscriptions', 'summary'] as const,
  },
  insights: {
    monthly: (month?: string) => ['insights', 'monthly', month] as const,
    trends: (params?: Record<string, any>) => ['insights', 'trends', params] as const,
    anomalies: (params?: Record<string, any>) => ['insights', 'anomalies', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: Record<string, any>) => ['notifications', 'list', filters] as const,
  },
}
