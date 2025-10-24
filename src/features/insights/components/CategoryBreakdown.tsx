/**
 * Category Breakdown Component
 * Displays spending by category
 */
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { formatCurrency, formatPercentage } from '@/shared/lib/utils/format'
import { getCategoryLabel, getCategoryIcon, getCategoryColor } from '@/shared/constants/categories'
import { useMonthlyInsights } from '../hooks/useInsights'
import type { ExpenseCategory } from '@/types'

interface CategoryBreakdownProps {
  month?: string
}

export function CategoryBreakdown({ month }: CategoryBreakdownProps) {
  const { data, isLoading, isError } = useMonthlyInsights(month)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12 text-red-500">
            載入失敗
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedCategories = (data.category_breakdown || [])
    .filter((cat) => cat.category !== 'INCOME')
    .sort((a, b) => b.amount - a.amount)

  if (sortedCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>分類統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            本月尚無支出記錄
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>分類統計</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCategories.map((item) => {
            const category = item.category as ExpenseCategory
            const color = getCategoryColor(category)

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {getCategoryIcon(category)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {getCategoryLabel(category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({item.count} 筆)
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPercentage(item.percentage)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
