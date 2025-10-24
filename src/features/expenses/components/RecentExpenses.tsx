'use client'

/**
 * Recent Expenses List Component
 * Displays the user's recent expense records
 */

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import type { Expense } from '@/types'

const categoryLabels: Record<string, string> = {
  FOOD: '飲食',
  TRANSPORT: '交通',
  ENTERTAINMENT: '娛樂',
  SHOPPING: '購物',
  HOUSING: '居住',
  MEDICAL: '醫療',
  EDUCATION: '教育',
  SUBSCRIPTION: '訂閱',
  OTHER: '其他',
  INCOME: '收入',
}

const categoryColors: Record<string, string> = {
  FOOD: 'bg-orange-100 text-orange-700',
  TRANSPORT: 'bg-blue-100 text-blue-700',
  ENTERTAINMENT: 'bg-purple-100 text-purple-700',
  SHOPPING: 'bg-pink-100 text-pink-700',
  HOUSING: 'bg-green-100 text-green-700',
  MEDICAL: 'bg-red-100 text-red-700',
  EDUCATION: 'bg-indigo-100 text-indigo-700',
  SUBSCRIPTION: 'bg-cyan-100 text-cyan-700',
  OTHER: 'bg-gray-100 text-gray-700',
  INCOME: 'bg-emerald-100 text-emerald-700',
}

export function RecentExpenses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['expenses', { page: 1, limit: 10 }],
    queryFn: async () => {
      const response = await fetch('/api/expenses?page=1&limit=10')
      if (!response.ok) throw new Error('Failed to fetch expenses')
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card animate-skeleton h-20" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center text-gray-500">
        載入失敗,請重試
      </div>
    )
  }

  const expenses = data?.data || []

  if (expenses.length === 0) {
    return (
      <div className="card text-center text-gray-500">
        還沒有任何記錄,開始記帳吧!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense: any) => (
        <div
          key={expense.id}
          className="card flex items-center justify-between hover:shadow-medium transition-shadow"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  categoryColors[expense.category] || categoryColors.OTHER
                }`}
              >
                {categoryLabels[expense.category] || expense.category}
              </span>
              {expense.fallback_used && (
                <span className="rounded-full bg-warning/10 px-2 py-1 text-xs text-warning">
                  備用
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {expense.description || '無描述'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {format(new Date(expense.date), 'PPP', { locale: zhTW })}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-xl font-bold ${
                expense.category === 'INCOME'
                  ? 'text-success'
                  : 'text-gray-900'
              }`}
            >
              {expense.category === 'INCOME' ? '+' : '-'}$
              {Number(expense.amount).toLocaleString()}
            </p>
            {expense.ai_confidence && (
              <p className="text-xs text-gray-400">
                信心度 {expense.ai_confidence}%
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
