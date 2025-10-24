/**
 * Analytics Cache Refresh Edge Function
 * Runs periodically to refresh analytics cache
 * Improves performance of analytics queries
 * US-020: 智能消費分析
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    // Get all active users
    const { data: users, error: usersError } = await supabaseClient
      .from('user_profiles')
      .select('user_id')

    if (usersError) {
      throw usersError
    }

    let cacheEntriesCreated = 0

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    // Refresh cache for current month and last 3 months
    const monthsToCache = [
      { year: currentYear, month: currentMonth },
      {
        year: currentMonth === 1 ? currentYear - 1 : currentYear,
        month: currentMonth === 1 ? 12 : currentMonth - 1,
      },
      {
        year: currentMonth <= 2 ? currentYear - 1 : currentYear,
        month: currentMonth <= 2 ? currentMonth + 10 : currentMonth - 2,
      },
      {
        year: currentMonth <= 3 ? currentYear - 1 : currentYear,
        month: currentMonth <= 3 ? currentMonth + 9 : currentMonth - 3,
      },
    ]

    for (const user of users) {
      for (const { year, month } of monthsToCache) {
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0, 23, 59, 59)

        // Fetch expenses for the month
        const { data: expenses, error: expensesError } = await supabaseClient
          .from('expenses')
          .select('amount, category, date')
          .eq('user_id', user.user_id)
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString())
          .is('deleted_at', null)

        if (expensesError) continue

        // Calculate analytics
        const analytics = {
          totalExpenses: 0,
          totalIncome: 0,
          netAmount: 0,
          transactionCount: expenses.length,
          byCategory: {} as Record<string, { amount: number; count: number }>,
          dailyTotals: {} as Record<string, number>,
        }

        expenses.forEach((expense: any) => {
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

        // Cache the result (30 days)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const cacheKey = `monthly_${user.user_id}_${year}_${month}`

        const { error: cacheError } = await supabaseClient
          .from('analytics_cache')
          .upsert({
            cache_key: cacheKey,
            user_id: user.user_id,
            cache_type: 'MONTHLY_ANALYTICS',
            data: analytics,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
          })

        if (!cacheError) {
          cacheEntriesCreated++
        }
      }
    }

    // Clean up expired cache entries
    const { error: cleanupError } = await supabaseClient
      .from('analytics_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analytics cache refreshed',
        stats: {
          usersProcessed: users.length,
          cacheEntriesCreated,
          cleanupPerformed: !cleanupError,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
