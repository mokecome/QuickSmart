/**
 * Subscription Form Component
 * Form for creating/editing subscriptions
 */
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import type { Subscription, BillingCycle } from '../api/subscriptionApi'

interface SubscriptionFormProps {
  subscription?: Subscription
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export function SubscriptionForm({
  subscription,
  onSubmit,
  onCancel,
  isLoading,
}: SubscriptionFormProps) {
  const [name, setName] = useState(subscription?.name || '')
  const [amount, setAmount] = useState(subscription?.amount.toString() || '')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    subscription?.billing_cycle || 'MONTHLY'
  )
  const [nextBillingDate, setNextBillingDate] = useState(
    subscription?.next_billing_date?.split('T')[0] || ''
  )
  const [autoRecord, setAutoRecord] = useState(subscription?.auto_record ?? true)
  const [reminderDays, setReminderDays] = useState<number[]>(
    subscription?.reminder_days || [3, 1, 0]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onSubmit({
      name,
      amount: parseFloat(amount),
      billing_cycle: billingCycle,
      next_billing_date: nextBillingDate,
      auto_record: autoRecord,
      reminder_days: reminderDays,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {subscription ? '編輯訂閱' : '新增訂閱'}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              訂閱名稱 *
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：Netflix、Spotify"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              金額 *
            </label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="390"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700 mb-1">
              扣款週期 *
            </label>
            <Select
              id="billingCycle"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
              disabled={isLoading}
            >
              <option value="WEEKLY">每週</option>
              <option value="MONTHLY">每月</option>
              <option value="QUARTERLY">每季</option>
              <option value="YEARLY">每年</option>
            </Select>
          </div>

          <div>
            <label htmlFor="nextBillingDate" className="block text-sm font-medium text-gray-700 mb-1">
              下次扣款日期 *
            </label>
            <Input
              id="nextBillingDate"
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="autoRecord"
              type="checkbox"
              checked={autoRecord}
              onChange={(e) => setAutoRecord(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoRecord" className="text-sm text-gray-700">
              自動記帳（扣款當天自動創建支出記錄）
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              扣款提醒
            </label>
            <div className="space-y-2">
              {[7, 3, 1, 0].map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`reminder-${day}`}
                    checked={reminderDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReminderDays([...reminderDays, day].sort((a, b) => b - a))
                      } else {
                        setReminderDays(reminderDays.filter((d) => d !== day))
                      }
                    }}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`reminder-${day}`} className="text-sm text-gray-700">
                    {day === 0 ? '扣款當天' : `提前 ${day} 天`}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                儲存中...
              </div>
            ) : (
              '儲存'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            取消
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
