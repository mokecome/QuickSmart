/**
 * Expense API Client
 * API calls for expense management
 */

export interface ParseExpenseRequest {
  input: string
}

export interface ParseExpenseResponse {
  amount: number
  category: string
  description: string
  confidence: number
  fallbackUsed: boolean
}

export interface CreateExpenseRequest {
  amount: number
  category: string
  description?: string
  date?: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description: string
  date: string
  ai_confidence: number | null
  fallback_used: boolean
  created_at: string
  updated_at: string
}

export interface ExpensesListResponse {
  expenses: Expense[]
  total: number
  page: number
  pageSize: number
}

/**
 * Parse natural language input to expense data
 */
export async function parseExpense(input: string): Promise<ParseExpenseResponse> {
  const response = await fetch('/api/expenses/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '�ѪR����')
  }

  return response.json()
}

/**
 * Get list of expenses
 */
export async function getExpenses(params?: {
  month?: string
  category?: string
  page?: number
  pageSize?: number
}): Promise<ExpensesListResponse> {
  const searchParams = new URLSearchParams()

  if (params?.month) searchParams.append('month', params.month)
  if (params?.category) searchParams.append('category', params.category)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString())

  const response = await fetch(`/api/expenses?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('�����X�C������')
  }

  return response.json()
}

/**
 * Get expense by ID
 */
export async function getExpense(id: string): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`)

  if (!response.ok) {
    throw new Error('�����X�Ա�����')
  }

  return response.json()
}

/**
 * Create new expense
 */
export async function createExpense(data: CreateExpenseRequest): Promise<Expense> {
  const response = await fetch('/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '�Ыؤ�X����')
  }

  return response.json()
}

/**
 * Delete expense (soft delete)
 */
export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '�R����X����')
  }
}
