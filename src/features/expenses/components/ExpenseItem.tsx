/**
 * Expense Item Component
 * Displays a single expense entry
 */
'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/shared/lib/utils/format'
import { getCategoryIcon, getCategoryLabel, getCategoryColor } from '@/shared/constants/categories'
import type { Expense } from '../api/expenseApi'
import type { ExpenseCategory } from '@/types'

interface ExpenseItemProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const categoryColor = getCategoryColor(expense.category as ExpenseCategory)

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl" title={getCategoryLabel(expense.category as ExpenseCategory)}>
              {getCategoryIcon(expense.category as ExpenseCategory)}
            </span>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {expense.description || '無描述'}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(expense.date, 'medium')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
              }}
            >
              {getCategoryLabel(expense.category as ExpenseCategory)}
            </Badge>

            {expense.ai_confidence !== null && expense.ai_confidence < 70 && (
              <Badge variant="warning">
                AI: {expense.ai_confidence}%
              </Badge>
            )}

            {expense.fallback_used && (
              <Badge variant="secondary">
                備用解析
              </Badge>
            )}
          </div>
        </div>

        <div className="text-right ml-4">
          <p
            className={`text-2xl font-bold ${
              expense.category === 'INCOME' ? 'text-green-600' : 'text-gray-900'
            }`}
          >
            {expense.category === 'INCOME' ? '+' : '-'}
            {formatCurrency(expense.amount)}
          </p>

          <div className="flex gap-1 mt-2">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(expense)}
              >
                編輯
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(expense.id)}
                className="text-red-500 hover:text-red-700"
              >
                刪除
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
