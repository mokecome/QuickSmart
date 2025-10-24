/**
 * Anomaly Detection Handler
 * Detects unusual spending patterns
 * US-021: 異常消費偵測
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
  const days = parseInt(searchParams.get('days') || '30') // Default 30 days
  const threshold = parseFloat(searchParams.get('threshold') || '2.0') // Standard deviations

  try {
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get historical baseline (last 90 days before the analysis period)
    const baselineEndDate = new Date(startDate)
    const baselineStartDate = new Date(baselineEndDate)
    baselineStartDate.setDate(baselineStartDate.getDate() - 90)

    // Fetch baseline expenses
    const { data: baselineExpenses, error: baselineError } = await supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', user.id)
      .gte('date', baselineStartDate.toISOString())
      .lt('date', startDate.toISOString())
      .is('deleted_at', null)
      .neq('category', 'INCOME')

    if (baselineError) {
      console.error('Error fetching baseline:', baselineError)
      return NextResponse.json(
        { error: 'Failed to fetch baseline data' },
        { status: 500 }
      )
    }

    // Fetch recent expenses
    const { data: recentExpenses, error: recentError } = await supabase
      .from('expenses')
      .select('id, amount, category, description, date')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .is('deleted_at', null)
      .neq('category', 'INCOME')

    if (recentError) {
      console.error('Error fetching recent expenses:', recentError)
      return NextResponse.json(
        { error: 'Failed to fetch recent expenses' },
        { status: 500 }
      )
    }

    // Calculate baseline statistics by category
    const baselineStats: Record<
      string,
      { amounts: number[]; mean: number; stdDev: number }
    > = {}

    baselineExpenses.forEach((expense: { category: string; amount: number }) => {
      const category = expense.category
      const amount = parseFloat(expense.amount.toString())

      if (!baselineStats[category]) {
        baselineStats[category] = { amounts: [], mean: 0, stdDev: 0 }
      }
      baselineStats[category].amounts.push(amount)
    })

    // Calculate mean and standard deviation for each category
    Object.keys(baselineStats).forEach((category) => {
      const amounts = baselineStats[category].amounts
      const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
      const variance =
        amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) /
        amounts.length
      const stdDev = Math.sqrt(variance)

      baselineStats[category].mean = mean
      baselineStats[category].stdDev = stdDev
    })

    // Detect anomalies
    const anomalies = recentExpenses
      .map((expense: { id: string; category: string; amount: number; description: string | null; date: string }) => {
        const category = expense.category
        const amount = parseFloat(expense.amount.toString())

        if (!baselineStats[category]) {
          // New category, can't determine if anomalous
          return null
        }

        const { mean, stdDev } = baselineStats[category]
        const zScore = stdDev > 0 ? (amount - mean) / stdDev : 0

        if (Math.abs(zScore) >= threshold) {
          return {
            id: expense.id,
            amount,
            category,
            description: expense.description,
            date: expense.date,
            expectedAmount: Math.round(mean * 100) / 100,
            deviation: Math.round((amount - mean) * 100) / 100,
            zScore: Math.round(zScore * 100) / 100,
            severity:
              Math.abs(zScore) >= 3
                ? 'high'
                : Math.abs(zScore) >= 2.5
                  ? 'medium'
                  : 'low',
          }
        }

        return null
      })
      .filter((a: any) => a !== null)

    // Calculate daily totals for overall spending anomalies
    const dailyTotals: Record<string, number> = {}
    recentExpenses.forEach((expense: { date: string; amount: number }) => {
      const date = expense.date.split('T')[0]
      const amount = parseFloat(expense.amount.toString())
      dailyTotals[date] = (dailyTotals[date] || 0) + amount
    })

    const dailyAmounts = Object.values(dailyTotals)
    const dailyMean =
      dailyAmounts.reduce((sum, a) => sum + a, 0) / dailyAmounts.length
    const dailyStdDev = Math.sqrt(
      dailyAmounts.reduce((sum, a) => sum + Math.pow(a - dailyMean, 2), 0) /
        dailyAmounts.length
    )

    const unusualDays = Object.entries(dailyTotals)
      .map(([date, total]) => {
        const zScore = dailyStdDev > 0 ? (total - dailyMean) / dailyStdDev : 0
        if (Math.abs(zScore) >= threshold) {
          return {
            date,
            total: Math.round(total * 100) / 100,
            expectedTotal: Math.round(dailyMean * 100) / 100,
            deviation: Math.round((total - dailyMean) * 100) / 100,
            zScore: Math.round(zScore * 100) / 100,
          }
        }
        return null
      })
      .filter((d) => d !== null)

    return NextResponse.json({
      data: {
        anomalousExpenses: anomalies,
        unusualDays,
        statistics: {
          totalExpensesAnalyzed: recentExpenses.length,
          anomaliesDetected: anomalies.length,
          unusualDaysDetected: unusualDays.length,
          threshold,
          baselinePeriodDays: 90,
          analysisPeriodDays: days,
        },
        baselineStats: Object.entries(baselineStats).map(
          ([category, stats]) => ({
            category,
            averageAmount: Math.round(stats.mean * 100) / 100,
            standardDeviation: Math.round(stats.stdDev * 100) / 100,
            sampleSize: stats.amounts.length,
          })
        ),
      },
    })
  } catch (error) {
    console.error('Anomaly detection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
