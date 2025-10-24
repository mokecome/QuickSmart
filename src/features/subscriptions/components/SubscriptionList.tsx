/**
 * Subscription List Component
 */
'use client'

import { useState } from 'react'
import { SubscriptionCard } from './SubscriptionCard'
import { SubscriptionForm } from './SubscriptionForm'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
  usePauseSubscription,
} from '../hooks/useSubscriptions'
import type { Subscription } from '../api/subscriptionApi'

export function SubscriptionList() {
  const { data: subscriptions, isLoading, isError } = useSubscriptions()
  const createMutation = useCreateSubscription()
  const updateMutation = useUpdateSubscription()
  const cancelMutation = useCancelSubscription()
  const pauseMutation = usePauseSubscription()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>()

  const handleCreate = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false)
      },
    })
  }

  const handleUpdate = (data: any) => {
    if (!editingSubscription) return

    updateMutation.mutate(
      { id: editingSubscription.id, data },
      {
        onSuccess: () => {
          setIsFormOpen(false)
          setEditingSubscription(undefined)
        },
      }
    )
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsFormOpen(true)
  }

  const handleCancel = (id: string) => {
    if (confirm('確定要取消這個訂閱嗎？')) {
      cancelMutation.mutate(id)
    }
  }

  const handlePause = (id: string) => {
    if (confirm('確定要暫停這個訂閱嗎？')) {
      pauseMutation.mutate(id)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingSubscription(undefined)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">載入失敗，請稍後再試</p>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-500 hover:underline"
        >
          重新載入
        </button>
      </div>
    )
  }

  // Empty state
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            還沒有訂閱記錄
          </h3>
          <p className="text-gray-500 mb-6">
            開始追蹤您的訂閱服務，不再錯過續約提醒！
          </p>
          <Button type="button" onClick={() => setIsFormOpen(true)}>
            新增訂閱
          </Button>
        </div>

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-lg">
            <SubscriptionForm
              onSubmit={handleCreate}
              onCancel={handleCloseForm}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">我的訂閱</h2>
          <p className="text-gray-500 mt-1">
            管理您的所有訂閱服務
          </p>
        </div>
        <Button type="button" onClick={() => setIsFormOpen(true)}>
          新增訂閱
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onPause={handlePause}
          />
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <SubscriptionForm
            subscription={editingSubscription}
            onSubmit={editingSubscription ? handleUpdate : handleCreate}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
