/**
 * Analytics Service
 * Application layer service for intelligent analysis
 * Implements business logic for US-020, US-021, US-014
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export class AnalyticsService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Get monthly analytics
   * US-014: 月度帳單
   */
  async getMonthlyAnalytics(
    userId: string,
    year: number,
    month: number
  ) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const cacheKey = `monthly_${userId}_${year}_${month}`

    // Check cache first
    const { data: cachedData } = await this.supabase
      .from('analytics_cache')
      .select('data')
      .eq('cache_key', cacheKey)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (cachedData) {
      return cachedData.data
    }

    // Fetch expenses
    const { data: expenses, error } = await this.supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .is('deleted_at', null)

    if (error) throw error

    // Calculate analytics
    const analytics = {
      totalExpenses: 0,
      totalIncome: 0,
      netAmount: 0,
      transactionCount: expenses.length,
      byCategory: {} as Record<string, { amount: number; count: number }>,
      dailyTotals: {} as Record<string, number>,
      topExpenses: [] as Array<{ date: string; amount: number; category: string }>,
    }

    expenses.forEach((expense) => {
      const amount = parseFloat(expense.amount.toString())
      const category = expense.category
      const date = expense.date.split('T')[0]

      if (category === 'INCOME') {
        analytics.totalIncome += amount
      } else {
        analytics.totalExpenses += amount
      }

      // By category
      if (!analytics.byCategory[category]) {
        analytics.byCategory[category] = { amount: 0, count: 0 }
      }
      analytics.byCategory[category].amount += amount
      analytics.byCategory[category].count += 1

      // Daily totals
      analytics.dailyTotals[date] = (analytics.dailyTotals[date] || 0) + amount
    })

    analytics.netAmount = analytics.totalIncome - analytics.totalExpenses

    // Cache the result (24 hours)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await this.supabase.from('analytics_cache').upsert({
      cache_key: cacheKey,
      user_id: userId,
      cache_type: 'MONTHLY_ANALYTICS',
      data: analytics,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })

    return analytics
  }

  /**
   * Analyze spending trends
   * US-020: 智能消費分析
   */
  async analyzeTrends(
    userId: string,
    months: number = 6,
    category?: string
  ) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    let query = this.supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .is('deleted_at', null)
      .neq('category', 'INCOME')

    if (category) {
      query = query.eq('category', category)
    }

    const { data: expenses, error } = await query

    if (error) throw error

    // Group by month
    const monthlyData: Record<string, { total: number; count: number }> = {}

    expenses.forEach((expense) => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const amount = parseFloat(expense.amount.toString())

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, count: 0 }
      }
      monthlyData[monthKey].total += amount
      monthlyData[monthKey].count += 1
    })

    // Calculate trends
    const trends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data], index, array) => {
        const changePercent =
          index > 0
            ? ((data.total - array[index - 1][1].total) / array[index - 1][1].total) * 100
            : 0

        return {
          month,
          total: Math.round(data.total * 100) / 100,
          count: data.count,
          average: Math.round((data.total / data.count) * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
        }
      })

    // Determine trend direction
    const recentTrends = trends.slice(-3)
    const isIncreasing =
      recentTrends.length >= 2 &&
      recentTrends[recentTrends.length - 1].total >
        recentTrends[recentTrends.length - 2].total

    return {
      trends,
      direction: isIncreasing ? 'increasing' : 'decreasing',
      averageMonthly:
        Math.round((trends.reduce((sum, t) => sum + t.total, 0) / trends.length) * 100) / 100,
    }
  }

  /**
   * Detect spending anomalies
   * US-021: 異常消費偵測
   */
  async detectAnomalies(
    userId: string,
    days: number = 30,
    threshold: number = 2.0
  ) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get baseline (90 days before analysis period)
    const baselineEndDate = new Date(startDate)
    const baselineStartDate = new Date(baselineEndDate)
    baselineStartDate.setDate(baselineStartDate.getDate() - 90)

    const { data: baselineExpenses, error: baselineError } = await this.supabase
      .from('expenses')
      .select('amount, category')
      .eq('user_id', userId)
      .gte('date', baselineStartDate.toISOString())
      .lt('date', startDate.toISOString())
      .is('deleted_at', null)
      .neq('category', 'INCOME')

    if (baselineError) throw baselineError

    const { data: recentExpenses, error: recentError } = await this.supabase
      .from('expenses')
      .select('id, amount, category, description, date')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .is('deleted_at', null)
      .neq('category', 'INCOME')

    if (recentError) throw recentError

    // Calculate baseline statistics by category
    const baselineStats: Record<
      string,
      { amounts: number[]; mean: number; stdDev: number }
    > = {}

    baselineExpenses.forEach((expense) => {
      const category = expense.category
      const amount = parseFloat(expense.amount.toString())

      if (!baselineStats[category]) {
        baselineStats[category] = { amounts: [], mean: 0, stdDev: 0 }
      }
      baselineStats[category].amounts.push(amount)
    })

    // Calculate mean and standard deviation
    Object.keys(baselineStats).forEach((category) => {
      const amounts = baselineStats[category].amounts
      const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
      const variance =
        amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
      const stdDev = Math.sqrt(variance)

      baselineStats[category].mean = mean
      baselineStats[category].stdDev = stdDev
    })

    // Detect anomalies
    const anomalies = recentExpenses
      .map((expense) => {
        const category = expense.category
        const amount = parseFloat(expense.amount.toString())

        if (!baselineStats[category]) {
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
            severity: Math.abs(zScore) >= 3 ? 'high' : Math.abs(zScore) >= 2.5 ? 'medium' : 'low',
          }
        }

        return null
      })
      .filter((a) => a !== null)

    return {
      anomalies,
      baselineStats: Object.entries(baselineStats).map(([category, stats]) => ({
        category,
        averageAmount: Math.round(stats.mean * 100) / 100,
        standardDeviation: Math.round(stats.stdDev * 100) / 100,
        sampleSize: stats.amounts.length,
      })),
    }
  }

  /**
   * Get category insights
   * US-020: 智能消費分析
   */
  async getCategoryInsights(userId: string, months: number = 3) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const { data: expenses, error } = await this.supabase
      .from('expenses')
      .select('amount, category, date')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .is('deleted_at', null)
      .neq('category', 'INCOME')

    if (error) throw error

    const categoryData: Record<
      string,
      { total: number; count: number; average: number }
    > = {}

    expenses.forEach((expense) => {
      const category = expense.category
      const amount = parseFloat(expense.amount.toString())

      if (!categoryData[category]) {
        categoryData[category] = { total: 0, count: 0, average: 0 }
      }
      categoryData[category].total += amount
      categoryData[category].count += 1
    })

    const totalSpent = Object.values(categoryData).reduce((sum, c) => sum + c.total, 0)

    return Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        total: Math.round(data.total * 100) / 100,
        count: data.count,
        average: Math.round((data.total / data.count) * 100) / 100,
        percentage: Math.round((data.total / totalSpent) * 10000) / 100,
      }))
      .sort((a, b) => b.total - a.total)
  }
}
