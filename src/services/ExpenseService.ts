/**
 * Expense Service
 * Application layer service for expense management
 * Implements business logic for US-001, US-002, US-003, US-004
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { AIParserService } from '@/lib/ai/parser'

type Expense = Database['public']['Tables']['expenses']['Row']
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export class ExpenseService {
  private supabase: SupabaseClient<Database>
  private aiParser: AIParserService

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
    this.aiParser = new AIParserService()
  }

  /**
   * Parse natural language input to expense data
   * US-001: AI 自然語言解析
   */
  async parseExpenseInput(input: string, userId: string) {
    // Fetch user's learning context
    const { data: learningSamples } = await this.supabase
      .from('ai_learning_samples')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    return this.aiParser.parse(input, {
      userId,
      learningSamples: learningSamples || [],
    })
  }

  /**
   * Create a new expense record
   * US-004: 消費記錄管理
   */
  async createExpense(userId: string, expenseData: Partial<ExpenseInsert>) {
    const expense: ExpenseInsert = {
      user_id: userId,
      amount: expenseData.amount!,
      category: expenseData.category!,
      description: expenseData.description || null,
      date: expenseData.date || new Date().toISOString(),
      ai_confidence: expenseData.ai_confidence || null,
      fallback_used: expenseData.fallback_used || false,
      version: 1,
      sync_status: 'SYNCED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * List expenses with pagination and filters
   * US-004: 消費記錄管理
   */
  async listExpenses(
    userId: string,
    options: {
      page?: number
      limit?: number
      category?: string
      startDate?: string
      endDate?: string
      search?: string
    } = {}
  ) {
    const { page = 1, limit = 20, category, startDate, endDate, search } = options
    const offset = (page - 1) * limit

    let query = this.supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) query = query.eq('category', category)
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    if (search) query = query.ilike('description', `%${search}%`)

    const { data, error, count } = await query

    if (error) throw error

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  }

  /**
   * Get expense by ID
   * US-004: 消費記錄管理
   */
  async getExpenseById(userId: string, expenseId: string) {
    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update expense with optimistic locking
   * US-004: 消費記錄管理
   * US-030: 多設備同步
   */
  async updateExpense(
    userId: string,
    expenseId: string,
    updates: Partial<ExpenseUpdate>,
    currentVersion: number
  ) {
    const updateData: ExpenseUpdate = {
      ...updates,
      version: currentVersion + 1,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .update(updateData)
      .eq('id', expenseId)
      .eq('user_id', userId)
      .eq('version', currentVersion)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('VERSION_CONFLICT')
      }
      throw error
    }

    return data
  }

  /**
   * Soft delete expense
   * US-004: 消費記錄管理
   */
  async deleteExpense(userId: string, expenseId: string) {
    const { error } = await this.supabase
      .from('expenses')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', expenseId)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) throw error
    return { success: true }
  }

  /**
   * Save user correction for AI learning
   * US-003: 個人化學習與修正
   */
  async saveCorrection(
    userId: string,
    originalInput: string,
    originalCategory: string,
    correctedCategory: string,
    expenseId?: string
  ) {
    const { data, error } = await this.supabase
      .from('ai_learning_samples')
      .insert({
        user_id: userId,
        original_input: originalInput,
        original_category: originalCategory,
        corrected_category: correctedCategory,
        expense_id: expenseId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Update expense category if expenseId provided
    if (expenseId) {
      await this.supabase
        .from('expenses')
        .update({ category: correctedCategory })
        .eq('id', expenseId)
        .eq('user_id', userId)
    }

    return data
  }

  /**
   * Get expense statistics
   * US-020: 智能消費分析
   */
  async getStatistics(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const { data: expenses, error } = await this.supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .is('deleted_at', null)

    if (error) throw error

    const stats = {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {} as Record<string, number>,
      transactionCount: expenses.length,
    }

    expenses.forEach((expense: { amount: number; category: string }) => {
      const amount = parseFloat(expense.amount.toString())

      if (expense.category === 'INCOME') {
        stats.totalIncome += amount
      } else {
        stats.totalExpenses += amount
        stats.byCategory[expense.category] =
          (stats.byCategory[expense.category] || 0) + amount
      }
    })

    return stats
  }
}
