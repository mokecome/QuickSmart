/**
 * Hook for parsing expense from natural language input
 */
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { parseExpense } from '../api/expenseApi'

export function useParseExpense() {
  return useMutation({
    mutationFn: (input: string) => parseExpense(input),
    onSuccess: (data) => {
      if (data.fallbackUsed) {
        toast.success('已使用基礎解析器處理', {
          icon: '⚠️',
        })
      } else if (data.confidence < 70) {
        toast.success('解析完成，請確認資訊是否正確')
      } else {
        toast.success('解析成功！')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || '解析失敗，請重試')
    },
  })
}
