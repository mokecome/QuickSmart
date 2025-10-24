/**
 * Subscription Billing Check Edge Function
 * Runs daily to check for upcoming subscription billings
 * Creates reminders and auto-records expenses
 * US-011: 帳單提醒
 * US-010: 訂閱記錄與管理
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number
  billing_cycle: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  next_billing_date: string
  reminder_days: number[]
  status: string
  auto_record: boolean
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active subscriptions that are due within next 7 days
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    const { data: subscriptions, error: fetchError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('status', 'ACTIVE')
      .gte('next_billing_date', today.toISOString())
      .lte('next_billing_date', sevenDaysLater.toISOString())

    if (fetchError) {
      throw fetchError
    }

    let processedCount = 0
    let remindersCreated = 0
    let expensesCreated = 0

    for (const subscription of subscriptions as Subscription[]) {
      const billingDate = new Date(subscription.next_billing_date)
      billingDate.setHours(0, 0, 0, 0)

      const daysUntilBilling = Math.ceil(
        (billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Create reminders if needed
      if (subscription.reminder_days.includes(daysUntilBilling)) {
        let title = ''
        let message = ''

        if (daysUntilBilling === 0) {
          title = '訂閱即將扣款'
          message = `您的 ${subscription.name} 訂閱今天將扣款 $${subscription.amount}`
        } else if (daysUntilBilling === 1) {
          title = '訂閱扣款提醒'
          message = `您的 ${subscription.name} 訂閱明天將扣款 $${subscription.amount}`
        } else {
          title = '訂閱扣款提醒'
          message = `您的 ${subscription.name} 訂閱將在 ${daysUntilBilling} 天後扣款 $${subscription.amount}`
        }

        const { error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: subscription.user_id,
            type: 'SUBSCRIPTION_REMINDER',
            title,
            message,
            related_id: subscription.id,
            created_at: new Date().toISOString(),
          })

        if (!notificationError) {
          remindersCreated++
        }
      }

      // Process billing if it's due today
      if (daysUntilBilling === 0) {
        // Create expense if auto_record is enabled
        if (subscription.auto_record) {
          const { error: expenseError } = await supabaseClient
            .from('expenses')
            .insert({
              user_id: subscription.user_id,
              amount: subscription.amount,
              category: 'SUBSCRIPTION',
              description: `${subscription.name} - 訂閱扣款`,
              date: today.toISOString(),
              version: 1,
              sync_status: 'SYNCED',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (!expenseError) {
            expensesCreated++
          }
        }

        // Calculate next billing date
        const nextBillingDate = calculateNextBillingDate(
          billingDate,
          subscription.billing_cycle
        )

        // Update subscription
        const { error: updateError } = await supabaseClient
          .from('subscriptions')
          .update({
            next_billing_date: nextBillingDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id)

        if (!updateError) {
          processedCount++
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription billing check completed',
        stats: {
          subscriptionsChecked: subscriptions.length,
          billingProcessed: processedCount,
          remindersCreated,
          expensesCreated,
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

function calculateNextBillingDate(
  currentDate: Date,
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
): Date {
  const nextDate = new Date(currentDate)

  switch (billingCycle) {
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + 7)
      break
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break
    case 'QUARTERLY':
      nextDate.setMonth(nextDate.getMonth() + 3)
      break
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }

  return nextDate
}
