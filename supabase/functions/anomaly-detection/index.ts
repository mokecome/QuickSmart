/**
 * Anomaly Detection Edge Function
 * Runs daily to detect unusual spending patterns
 * Creates notifications for detected anomalies
 * US-021: 異常消費偵測
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Expense {
  id: string
  user_id: string
  amount: number
  category: string
  description: string | null
  date: string
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const threshold = 2.0 // Standard deviations
    const analysisWindowDays = 7 // Check last 7 days
    const baselineWindowDays = 90 // 90 days baseline

    const today = new Date()
    const analysisStartDate = new Date(today)
    analysisStartDate.setDate(analysisStartDate.getDate() - analysisWindowDays)

    const baselineEndDate = new Date(analysisStartDate)
    const baselineStartDate = new Date(baselineEndDate)
    baselineStartDate.setDate(baselineStartDate.getDate() - baselineWindowDays)

    // Get all active users
    const { data: users, error: usersError } = await supabaseClient
      .from('user_profiles')
      .select('user_id')

    if (usersError) {
      throw usersError
    }

    let totalAnomaliesDetected = 0
    let notificationsCreated = 0

    // Process each user
    for (const user of users) {
      // Get baseline expenses
      const { data: baselineExpenses, error: baselineError } = await supabaseClient
        .from('expenses')
        .select('amount, category')
        .eq('user_id', user.user_id)
        .gte('date', baselineStartDate.toISOString())
        .lt('date', analysisStartDate.toISOString())
        .is('deleted_at', null)
        .neq('category', 'INCOME')

      if (baselineError) continue

      // Get recent expenses
      const { data: recentExpenses, error: recentError } = await supabaseClient
        .from('expenses')
        .select('id, amount, category, description, date')
        .eq('user_id', user.user_id)
        .gte('date', analysisStartDate.toISOString())
        .lte('date', today.toISOString())
        .is('deleted_at', null)
        .neq('category', 'INCOME')

      if (recentError) continue

      // Calculate baseline statistics by category
      const baselineStats: Record<string, { amounts: number[]; mean: number; stdDev: number }> = {}

      baselineExpenses.forEach((expense: Expense) => {
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
        if (amounts.length < 5) {
          // Need at least 5 samples
          delete baselineStats[category]
          return
        }

        const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
        const variance =
          amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
        const stdDev = Math.sqrt(variance)

        baselineStats[category].mean = mean
        baselineStats[category].stdDev = stdDev
      })

      // Detect anomalies
      for (const expense of recentExpenses as Expense[]) {
        const category = expense.category
        const amount = parseFloat(expense.amount.toString())

        if (!baselineStats[category]) continue

        const { mean, stdDev } = baselineStats[category]
        if (stdDev === 0) continue

        const zScore = (amount - mean) / stdDev

        if (Math.abs(zScore) >= threshold) {
          totalAnomaliesDetected++

          const deviation = amount - mean
          const percentChange = Math.round((deviation / mean) * 100)

          // Create notification
          const { error: notificationError } = await supabaseClient
            .from('notifications')
            .insert({
              user_id: user.user_id,
              type: 'ANOMALY_DETECTED',
              title: '檢測到異常消費',
              message: `您在 ${getCategoryLabel(category)} 類別的消費 $${amount} 比平均值 $${Math.round(mean)} ${percentChange > 0 ? '高' : '低'}出 ${Math.abs(percentChange)}%`,
              related_id: expense.id,
              created_at: new Date().toISOString(),
            })

          if (!notificationError) {
            notificationsCreated++
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Anomaly detection completed',
        stats: {
          usersProcessed: users.length,
          anomaliesDetected: totalAnomaliesDetected,
          notificationsCreated,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    FOOD: '飲食',
    TRANSPORT: '交通',
    ENTERTAINMENT: '娛樂',
    SHOPPING: '購物',
    HOUSING: '居住',
    MEDICAL: '醫療',
    EDUCATION: '教育',
    SUBSCRIPTION: '訂閱',
    OTHER: '其他',
  }
  return labels[category] || category
}
