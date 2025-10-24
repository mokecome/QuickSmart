/**
 * Subscription Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { queryKeys } from '@/shared/config/queryClient'
import {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  pauseSubscription,
  getSubscriptionSummary,
} from '../api/subscriptionApi'
import type { CreateSubscriptionRequest, UpdateSubscriptionRequest } from '../api/subscriptionApi'

/**
 * Get all subscriptions
 */
export function useSubscriptions() {
  return useQuery({
    queryKey: queryKeys.subscriptions.all,
    queryFn: getSubscriptions,
  })
}

/**
 * Get subscription summary
 */
export function useSubscriptionSummary() {
  return useQuery({
    queryKey: queryKeys.subscriptions.summary(),
    queryFn: getSubscriptionSummary,
  })
}

/**
 * Get single subscription
 */
export function useSubscription(id: string) {
  return useQuery({
    queryKey: queryKeys.subscriptions.detail(id),
    queryFn: () => getSubscription(id),
    enabled: !!id,
  })
}

/**
 * Create subscription mutation
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => createSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
      toast.success('訂閱創建成功！')
    },
    onError: (error: Error) => {
      toast.error(error.message || '創建失敗')
    },
  })
}

/**
 * Update subscription mutation
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubscriptionRequest }) =>
      updateSubscription(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.detail(variables.id) })
      toast.success('訂閱更新成功！')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失敗')
    },
  })
}

/**
 * Cancel subscription mutation
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cancelSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
      toast.success('訂閱已取消')
    },
    onError: (error: Error) => {
      toast.error(error.message || '取消失敗')
    },
  })
}

/**
 * Pause subscription mutation
 */
export function usePauseSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pauseSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all })
      toast.success('訂閱已暫停')
    },
    onError: (error: Error) => {
      toast.error(error.message || '暫停失敗')
    },
  })
}
