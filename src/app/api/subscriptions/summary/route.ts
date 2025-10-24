/**
 * Subscription Summary Handler
 * Gets subscription statistics and summary
 * US-010: 訂閱管理
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

  try {
    // Get all active subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['ACTIVE', 'PAUSED'])
      .order('next_billing_date', { ascending: true })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const activeSubscriptions = subscriptions.filter(
      (sub: { status: string }) => sub.status === 'ACTIVE'
    )
    const pausedSubscriptions = subscriptions.filter(
      (sub: { status: string }) => sub.status === 'PAUSED'
    )

    // Calculate total monthly cost
    const monthlyTotal = activeSubscriptions.reduce((total: number, sub: { amount: number; billing_cycle: string }) => {
      const amount = parseFloat(sub.amount.toString())
      switch (sub.billing_cycle) {
        case 'MONTHLY':
          return total + amount
        case 'QUARTERLY':
          return total + amount / 3
        case 'YEARLY':
          return total + amount / 12
        case 'WEEKLY':
          return total + (amount * 52) / 12
        default:
          return total
      }
    }, 0)

    // Calculate yearly total
    const yearlyTotal = monthlyTotal * 12

    // Get upcoming billings (next 30 days)
    const today = new Date()
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

    const upcomingBillings = activeSubscriptions
      .filter((sub: { next_billing_date: string }) => {
        const billingDate = new Date(sub.next_billing_date)
        return billingDate >= today && billingDate <= thirtyDaysLater
      })
      .map((sub: { id: string; name: string; amount: number; next_billing_date: string }) => ({
        id: sub.id,
        name: sub.name,
        amount: sub.amount,
        nextBillingDate: sub.next_billing_date,
      }))

    return NextResponse.json({
      data: {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        pausedSubscriptions: pausedSubscriptions.length,
        monthlyTotal: Math.round(monthlyTotal * 100) / 100,
        yearlyTotal: Math.round(yearlyTotal * 100) / 100,
        upcomingBillings,
        subscriptions,
      },
    })
  } catch (error) {
    console.error('Subscription summary error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
