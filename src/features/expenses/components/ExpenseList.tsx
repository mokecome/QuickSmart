/**
 * Expense List Component
 * Displays a list of expenses with infinite scroll
 */
'use client'

import { useRef, useEffect } from 'react'
import { ExpenseItem } from './ExpenseItem'
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner'
import { useExpenses } from '../hooks/useExpenses'
import { useDeleteExpense } from '../hooks/useExpenseMutation'

interface ExpenseListProps {
  month?: string
  category?: string
  onEdit?: (expense: any) => void
}

export function ExpenseList({ month, category, onEdit }: ExpenseListProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses({ month, category })

  const deleteMutation = useDeleteExpense()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這筆記錄嗎？')) {
      deleteMutation.mutate(id)
    }
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

  const expenses = data?.pages.flatMap((page) => page.expenses) ?? []

  // Empty state
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          還沒有記帳記錄
        </h3>
        <p className="text-gray-500">
          開始記第一筆帳吧！試試看輸入「午餐 150」
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage && <LoadingSpinner size="sm" />}
        </div>
      )}

      {/* End message */}
      {!hasNextPage && expenses.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-4">
          已載入全部記錄
        </p>
      )}
    </div>
  )
}
