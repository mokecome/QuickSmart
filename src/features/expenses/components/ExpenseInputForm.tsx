'use client'

/**
 * Expense Input Form Component
 * US-001: AI 自然語言解析
 * Allows users to input expenses in natural language
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { useParseExpense } from '../hooks/useParseExpense'
import { useCreateExpense } from '../hooks/useExpenseMutation'
import { CATEGORY_LIST } from '@/shared/constants/categories'
import type { ParseExpenseResponse } from '../api/expenseApi'

export function ExpenseInputForm() {
  const [input, setInput] = useState('')
  const [parsedData, setParsedData] = useState<ParseExpenseResponse | null>(null)

  // Use custom hooks
  const parseMutation = useParseExpense()
  const createMutation = useCreateExpense()

  const handleParse = async () => {
    if (!input.trim()) return
    parseMutation.mutate(input, {
      onSuccess: (data) => {
        setParsedData(data)
      },
    })
  }

  const handleConfirm = () => {
    if (!parsedData) return
    createMutation.mutate(
      {
        amount: parsedData.amount,
        category: parsedData.category,
        description: parsedData.description,
      },
      {
        onSuccess: () => {
          setInput('')
          setParsedData(null)
        },
      }
    )
  }

  const handleEdit = (field: keyof ParseExpenseResponse, value: any) => {
    if (!parsedData) return
    setParsedData({ ...parsedData, [field]: value })
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <label htmlFor="expense-input" className="mb-2 block text-sm font-medium text-gray-700">
          快速記帳
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="expense-input"
              type="text"
              placeholder="試試看輸入「午餐 150」"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleParse()}
              disabled={parseMutation.isPending}
              className="h-12"
            />
            {parseMutation.isPending && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          <Button
            onClick={handleParse}
            disabled={parseMutation.isPending || !input.trim()}
            size="lg"
          >
            {parseMutation.isPending ? '解析中...' : '解析'}
          </Button>
        </div>
      </div>

      {/* Parsed Result */}
      {parsedData && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">確認資訊</h3>
            <div className="flex items-center gap-2">
              {parsedData.fallbackUsed && (
                <Badge variant="warning">使用備用解析</Badge>
              )}
              <span className="text-sm text-gray-500">
                信心度: {parsedData.confidence}%
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">金額</label>
              <Input
                type="number"
                value={parsedData.amount}
                onChange={(e) => handleEdit('amount', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">分類</label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={parsedData.category}
                onChange={(e) => handleEdit('category', e.target.value)}
              >
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">描述</label>
              <Input
                type="text"
                value={parsedData.description}
                onChange={(e) => handleEdit('description', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleConfirm}
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? '儲存中...' : '確認儲存'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setParsedData(null)}
            >
              取消
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
