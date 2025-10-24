/**
 * Insights API Client
 * API calls for analytics and insights
 */

export interface MonthlyInsights {
  total_expenses: number
  total_income: number
  net_amount: number
  transaction_count: number
  category_breakdown: Array<{
    category: string
    amount: number
    count: number
    percentage: number
  }>
  daily_totals: Record<string, number>
}

export interface TrendData {
  trends: Array<{
    month: string
    total: number
    count: number
    average: number
    changePercent: number
  }>
  direction: 'increasing' | 'decreasing'
  averageMonthly: number
}

export interface Anomaly {
  id: string
  amount: number
  category: string
  description: string
  date: string
  expectedAmount: number
  deviation: number
  zScore: number
  severity: 'low' | 'medium' | 'high'
}

export interface AnomalyResponse {
  anomalies: Anomaly[]
  baselineStats: Array<{
    category: string
    averageAmount: number
    standardDeviation: number
    sampleSize: number
  }>
}

/**
 * Get monthly analytics
 */
export async function getMonthlyInsights(month?: string): Promise<MonthlyInsights> {
  const params = new URLSearchParams()
  if (month) params.append('month', month)

  const response = await fetch(`/api/analytics/monthly?${params.toString()}`)

  if (!response.ok) {
    throw new Error('獲取月度分析失敗')
  }

  return response.json()
}

/**
 * Get spending trends
 */
export async function getTrends(params?: {
  months?: number
  category?: string
}): Promise<TrendData> {
  const searchParams = new URLSearchParams()
  if (params?.months) searchParams.append('months', params.months.toString())
  if (params?.category) searchParams.append('category', params.category)

  const response = await fetch(`/api/insights/trends?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('獲取趨勢分析失敗')
  }

  return response.json()
}

/**
 * Detect spending anomalies
 */
export async function getAnomalies(params?: {
  days?: number
  threshold?: number
}): Promise<AnomalyResponse> {
  const searchParams = new URLSearchParams()
  if (params?.days) searchParams.append('days', params.days.toString())
  if (params?.threshold) searchParams.append('threshold', params.threshold.toString())

  const response = await fetch(`/api/insights/anomalies?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('獲取異常偵測失敗')
  }

  return response.json()
}
