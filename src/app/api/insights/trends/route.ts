/**
 * Spending Trends Handler
 * Analyzes spending trends and patterns
 * US-020: 智能消費分析
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const months = parseInt(searchParams.get('months') || '6') // Default 6 months
  const category = searchParams.get('category') // Optional category filter

  try {
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Build query
    let query = supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .is('deleted_at', null)
      .neq('category', 'INCOME')

    if (category) {
      query = query.eq('category', category)
    }

    const { data: expenses, error } = await query

    if (error) {
      console.error('Error fetching expenses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch expenses' },
        { status: 500 }
      )
    }

    // Group expenses by month
    const monthlyData: Record<string, { total: number; count: number }> = {}
    const categoryData: Record<string, number> = {}

    expenses.forEach((expense: { date: string; amount: number; category: string }) => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const amount = parseFloat(expense.amount.toString())

      // Monthly totals
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 }
      }
      monthlyData[monthKey].total += amount
      monthlyData[monthKey].count += 1

      // Category totals
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = 0
      }
      categoryData[expense.category] += amount
    })

    // Calculate trends
    const monthlyTrends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
        average: Math.round((data.total / data.count) * 100) / 100,
      }))

    // Calculate month-over-month change
    const trends = monthlyTrends.map((current, index) => {
      if (index === 0) {
        return { ...current, changePercent: 0 }
      }
      const previous = monthlyTrends[index - 1]
      const changePercent =
        previous.total > 0
          ? Math.round(((current.total - previous.total) / previous.total) * 10000) / 100
          : 0
      return { ...current, changePercent }
    })

    // Calculate overall statistics
    const totalSpent = monthlyTrends.reduce((sum, m) => sum + m.total, 0)
    const averageMonthly = totalSpent / monthlyTrends.length
    const lastMonthTotal = monthlyTrends[monthlyTrends.length - 1]?.total || 0

    // Identify trend direction
    const recentTrends = monthlyTrends.slice(-3)
    const trendDirection =
      recentTrends.length >= 2
        ? recentTrends[recentTrends.length - 1].total >
          recentTrends[recentTrends.length - 2].total
          ? 'increasing'
          : 'decreasing'
        : 'stable'

    return NextResponse.json({
      data: {
        monthlyTrends: trends,
        categoryBreakdown: Object.entries(categoryData)
          .map(([category, total]) => ({
            category,
            total: Math.round(total * 100) / 100,
            percentage: Math.round((total / totalSpent) * 10000) / 100,
          }))
          .sort((a, b) => b.total - a.total),
        statistics: {
          totalSpent: Math.round(totalSpent * 100) / 100,
          averageMonthly: Math.round(averageMonthly * 100) / 100,
          lastMonthTotal: Math.round(lastMonthTotal * 100) / 100,
          trendDirection,
        },
        metadata: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          months,
          category: category || 'all',
        },
      },
    })
  } catch (error) {
    console.error('Trends analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
