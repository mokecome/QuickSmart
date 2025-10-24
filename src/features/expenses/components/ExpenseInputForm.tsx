'use client'

/**
 * Expense Input Form Component
 * US-001: AI 自然語言解析
 * Allows users to input expenses in natural language
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ParseExpenseResponse } from '@/types'

export function ExpenseInputForm() {
  const [input, setInput] = useState('')
  const [parsedData, setParsedData] = useState<ParseExpenseResponse | null>(null)
  const queryClient = useQueryClient()

  // Parse expense mutation
  const parseMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await fetch('/api/expenses/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })
      if (!response.ok) throw new Error('Failed to parse')
      return response.json()
    },
    onSuccess: (data: ParseExpenseResponse) => {
      setParsedData(data)
    },
  })

  // Create expense mutation
  const createMutation = useMutation({
    mutationFn: async (data: ParseExpenseResponse) => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: data.amount,
          category: data.category,
          description: data.description,
        }),
      })
      if (!response.ok) throw new Error('Failed to create expense')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setInput('')
      setParsedData(null)
    },
  })

  const handleParse = async () => {
    if (!input.trim()) return
    parseMutation.mutate(input)
  }

  const handleConfirm = () => {
    if (!parsedData) return
    createMutation.mutate(parsedData)
  }

  const handleEdit = (field: keyof ParseExpenseResponse, value: any) => {
    if (!parsedData) return
    setParsedData({ ...parsedData, [field]: value })
  }

  return (
    <div className="card">
      <div className="mb-4">
        <label htmlFor="expense-input" className="mb-2 block text-sm font-medium text-gray-700">
          快速記帳
        </label>
        <div className="flex gap-2">
          <input
            id="expense-input"
            type="text"
            className="input flex-1"
            placeholder="例如: 午餐 150、坐捷運 30 元"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            disabled={parseMutation.isPending}
          />
          <button
            onClick={handleParse}
            disabled={parseMutation.isPending || !input.trim()}
            className="btn-primary"
          >
            {parseMutation.isPending ? '解析中...' : '解析'}
          </button>
        </div>
      </div>

      {/* Parsing Error */}
      {parseMutation.isError && (
        <div className="mb-4 rounded-lg bg-error/10 p-4 text-sm text-error">
          解析失敗,請重試
        </div>
      )}

      {/* Parsed Result */}
      {parsedData && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">確認資訊</h3>
            {parsedData.fallbackUsed && (
              <span className="rounded-full bg-warning/10 px-2 py-1 text-xs text-warning">
                使用備用解析
              </span>
            )}
            <span className="text-sm text-gray-500">
              信心度: {parsedData.confidence}%
            </span>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm text-gray-600">金額</label>
              <input
                type="number"
                className="input"
                value={parsedData.amount}
                onChange={(e) => handleEdit('amount', parseFloat(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">分類</label>
              <select
                className="input"
                value={parsedData.category}
                onChange={(e) => handleEdit('category', e.target.value)}
              >
                <option value="FOOD">飲食</option>
                <option value="TRANSPORT">交通</option>
                <option value="ENTERTAINMENT">娛樂</option>
                <option value="SHOPPING">購物</option>
                <option value="HOUSING">居住</option>
                <option value="MEDICAL">醫療</option>
                <option value="EDUCATION">教育</option>
                <option value="SUBSCRIPTION">訂閱</option>
                <option value="OTHER">其他</option>
                <option value="INCOME">收入</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">描述</label>
              <input
                type="text"
                className="input"
                value={parsedData.description}
                onChange={(e) => handleEdit('description', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={createMutation.isPending}
              className="btn-primary flex-1"
            >
              {createMutation.isPending ? '儲存中...' : '確認儲存'}
            </button>
            <button
              onClick={() => setParsedData(null)}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
