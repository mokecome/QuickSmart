/**
 * Subscription Card Component
 * Displays a single subscription with billing info
 */
'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/shared/lib/utils/format'
import { getDaysUntil } from '@/shared/lib/utils/date'
import { cn } from '@/shared/lib/utils/cn'
import type { Subscription } from '../api/subscriptionApi'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit?: (subscription: Subscription) => void
  onCancel?: (id: string) => void
  onPause?: (id: string) => void
}

const BILLING_CYCLE_LABELS = {
  WEEKLY: '每週',
  MONTHLY: '每月',
  QUARTERLY: '每季',
  YEARLY: '每年',
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onCancel,
  onPause,
}: SubscriptionCardProps) {
  const daysUntilBilling = getDaysUntil(subscription.next_billing_date)
  const isUpcoming = daysUntilBilling <= 3 && daysUntilBilling >= 0
  const isActive = subscription.status === 'ACTIVE'

  const getBillingText = () => {
    if (daysUntilBilling === 0) return '今天扣款'
    if (daysUntilBilling === 1) return '明天扣款'
    if (daysUntilBilling < 0) return '已過期'
    return `${daysUntilBilling} 天後扣款`
  }

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'ACTIVE':
        return <Badge variant="success">活躍</Badge>
      case 'PAUSED':
        return <Badge variant="warning">已暫停</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">已取消</Badge>
      default:
        return null
    }
  }

  return (
    <Card
      className={cn(
        'p-4 transition-all',
        isUpcoming && isActive && 'border-yellow-500 border-2 shadow-md',
        subscription.status === 'CANCELLED' && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {subscription.name}
            </h3>
            {getStatusBadge()}
          </div>

          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(subscription.amount)}
            <span className="text-sm text-gray-500 ml-1 font-normal">
              / {BILLING_CYCLE_LABELS[subscription.billing_cycle]}
            </span>
          </p>
        </div>

        {subscription.auto_record && (
          <Badge variant="outline" className="text-xs">
            自動記帳
          </Badge>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">下次扣款</span>
          <span className="font-medium">
            {formatDate(subscription.next_billing_date, 'medium')}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">扣款倒數</span>
          <span
            className={cn(
              'font-medium',
              isUpcoming && isActive ? 'text-yellow-600' : 'text-gray-900'
            )}
          >
            {getBillingText()}
          </span>
        </div>

        {subscription.reminder_days.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">提醒設置</span>
            <span className="text-gray-900">
              提前 {subscription.reminder_days.join(', ')} 天
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isActive && onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(subscription)}
            className="flex-1"
          >
            編輯
          </Button>
        )}

        {isActive && onPause && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPause(subscription.id)}
            className="flex-1"
          >
            暫停
          </Button>
        )}

        {isActive && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(subscription.id)}
            className="flex-1 text-red-500 hover:text-red-700"
          >
            取消
          </Button>
        )}
      </div>
    </Card>
  )
}
