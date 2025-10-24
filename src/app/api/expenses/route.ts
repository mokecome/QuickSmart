/**
 * GET /api/expenses - List user expenses
 * POST /api/expenses - Create new expense
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateExpenseRequest } from '@/types'

export const dynamic = 'force-dynamic'

// GET /api/expenses
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
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSizeParam =
      searchParams.get('pageSize') ?? searchParams.get('limit') ?? '20'
    const parsedLimit = Number.parseInt(pageSizeParam, 10)
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    let query = supabase
      .from('expenses')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('date', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      expenses: data || [],
      total: count || 0,
      page,
      pageSize: limit,
    })
  } catch (error) {
    console.error('List expenses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST /api/expenses
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

    const body: CreateExpenseRequest = await request.json()
    const { amount, category, description, date } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Create expense
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount,
        category,
        description: description || null,
        date: date || new Date().toISOString(),
        source: 'MANUAL',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Create expense error:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
