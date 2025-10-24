/**
 * Hooks for expense mutations (create, delete)
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { queryKeys } from '@/shared/config/queryClient'
import { createExpense, deleteExpense } from '../api/expenseApi'
import type { CreateExpenseRequest } from '../api/expenseApi'

/**
 * Create expense mutation
 */
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(data),
    onSuccess: () => {
      // Invalidate expenses queries to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all })
      // Invalidate insights queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: ['insights'] })
      toast.success('�O�b���\�I')
    },
    onError: (error: Error) => {
      toast.error(error.message || '�Ыإ���')
    },
  })
}

/**
 * Delete expense mutation
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all })
      // Invalidate insights queries to refresh analytics
      queryClient.invalidateQueries({ queryKey: ['insights'] })
      toast.success('�w�R��')
    },
    onError: (error: Error) => {
      toast.error(error.message || '�R������')
    },
  })
}
