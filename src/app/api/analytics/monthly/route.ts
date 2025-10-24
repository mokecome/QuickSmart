/**
 * GET /api/analytics/monthly
 * Get monthly statistics and insights
 * US-014: 月度支出統計
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth } from 'date-fns'

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
      .filter((e: { category: string }) => e.category !== 'INCOME')
      .reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0)

    const totalIncome = expenses
      .filter((e: { category: string }) => e.category === 'INCOME')
      .reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0)

    // Category breakdown with counts
    const categoryStats: Record<string, { amount: number; count: number }> = {}
    expenses.forEach((expense: { category: string; amount: number }) => {
      if (expense.category !== 'INCOME') {
        if (!categoryStats[expense.category]) {
          categoryStats[expense.category] = { amount: 0, count: 0 }
        }
        categoryStats[expense.category].amount += Number(expense.amount)
        categoryStats[expense.category].count += 1
      }
    })

    // Convert to array format with percentage
    const categoryBreakdown = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        amount: stats.amount,
        count: stats.count,
        percentage: totalExpenses > 0 ? (stats.amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    const transactionCount = expenses.filter((e: { category: string }) => e.category !== 'INCOME').length
    const netAmount = totalIncome - totalExpenses
    const averageTransaction =
      transactionCount > 0 ? totalExpenses / transactionCount : 0

    // Daily totals (for charts)
    const dailyTotals: Record<string, number> = {}
    expenses.forEach((expense) => {
      const dateKey = new Date(expense.date).toISOString().split('T')[0]
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + Number(expense.amount)
    })

    const response = {
      total_expenses: totalExpenses,
      total_income: totalIncome,
      net_amount: netAmount,
      transaction_count: transactionCount,
      category_breakdown: categoryBreakdown,
      daily_totals: dailyTotals,
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
