/**
 * Monthly Stats Component
 * Displays monthly financial statistics
 */
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { formatCurrency } from '@/shared/lib/utils/format'
import { useMonthlyInsights } from '../hooks/useInsights'

interface MonthlyStatsProps {
  month?: string
}

export function MonthlyStats({ month }: MonthlyStatsProps) {
  const { data, isLoading, isError } = useMonthlyInsights(month)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12 text-red-500">
        載入失敗
      </div>
    )
  }

  const stats = [
    {
      title: '總支出',
      value: data.total_expenses,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: '總收入',
      value: data.total_income,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '淨額',
      value: data.net_amount,
      color: data.net_amount >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: data.net_amount >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: '交易筆數',
      value: data.transaction_count,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      isCount: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor} mb-3`}>
              <span className={`text-2xl font-bold ${stat.color}`}>
                {stat.isCount ? '📊' : '💰'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{stat.title}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>
              {stat.isCount ? stat.value : formatCurrency(stat.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
