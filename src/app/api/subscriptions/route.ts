/**
 * GET /api/subscriptions - List user subscriptions
 * POST /api/subscriptions - Create new subscription
 * US-010: 新增訂閱
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateSubscriptionRequest } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/subscriptions
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
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('next_billing_date', { ascending: true })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Calculate monthly total
    const monthlyTotal = data
      .filter((sub: { status: string; billing_cycle: string }) => sub.status === 'ACTIVE' && sub.billing_cycle === 'MONTHLY')
      .reduce((sum: number, sub: { amount: number }) => sum + Number(sub.amount), 0)

    const yearlyTotal = data
      .filter((sub: { status: string; billing_cycle: string }) => sub.status === 'ACTIVE' && sub.billing_cycle === 'YEARLY')
      .reduce((sum: number, sub: { amount: number }) => sum + Number(sub.amount), 0)

    return NextResponse.json({
      data,
      summary: {
        monthlyTotal,
        yearlyTotal,
        totalActive: data.filter((sub: { status: string }) => sub.status === 'ACTIVE').length,
      },
    })
  } catch (error) {
    console.error('List subscriptions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// POST /api/subscriptions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateSubscriptionRequest = await request.json()
    const {
      name,
      amount,
      category,
      billingCycle,
      nextBillingDate,
      notificationDays,
      autoRecord,
    } = body

    // Validate required fields
    if (!name || !amount || !billingCycle || !nextBillingDate) {
      return NextResponse.json(
        { error: 'Name, amount, billingCycle, and nextBillingDate are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        name,
        amount,
        category: category || 'SUBSCRIPTION',
        billing_cycle: billingCycle,
        next_billing_date: nextBillingDate,
        notification_days: notificationDays || [3, 1, 0],
        auto_record: autoRecord ?? true,
        status: 'ACTIVE',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
