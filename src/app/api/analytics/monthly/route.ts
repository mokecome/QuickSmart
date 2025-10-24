/**
 * GET /api/analytics/monthly
 * Get monthly statistics and insights
 * US-014: 月度支出統計
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import type { MonthlyStatsResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const monthParam = searchParams.get('month') // Format: YYYY-MM
    const targetMonth = monthParam ? new Date(monthParam + '-01') : new Date()

    const monthStart = startOfMonth(targetMonth)
    const monthEnd = endOfMonth(targetMonth)

    // Fetch expenses for the month
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart.toISOString())
      .lte('date', monthEnd.toISOString())
      .is('deleted_at', null)

    if (error) {
      throw error
    }

    // Calculate statistics
    const totalExpenses = expenses
      .filter((e) => e.category !== 'INCOME')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const totalIncome = expenses
      .filter((e) => e.category === 'INCOME')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {}
    expenses.forEach((expense) => {
      if (expense.category !== 'INCOME') {
        categoryBreakdown[expense.category] =
          (categoryBreakdown[expense.category] || 0) + Number(expense.amount)
      }
    })

    // Top categories
    const topCategories = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        category: category as any,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    const transactionCount = expenses.filter((e) => e.category !== 'INCOME').length
    const averageTransaction =
      transactionCount > 0 ? totalExpenses / transactionCount : 0

    const response: MonthlyStatsResponse = {
      totalExpenses,
      totalIncome,
      categoryBreakdown: categoryBreakdown as any,
      transactionCount,
      averageTransaction,
      topCategories,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Monthly analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
