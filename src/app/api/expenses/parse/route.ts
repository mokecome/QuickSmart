/**
 * POST /api/expenses/parse
 * Parse natural language input to expense data
 * US-001: AI 自然語言解析
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiParser } from '@/lib/ai/parser'
import type { ParseExpenseRequest, ParseExpenseResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body: ParseExpenseRequest = await request.json()
    const { input } = body

    if (!input || input.trim().length === 0) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 })
    }

    // Get user's learning samples for context
    const { data: learningSamples } = await supabase
      .from('ai_learning_samples')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Parse with AI
    const result: ParseExpenseResponse = await aiParser.parse(input, {
      userId: user.id,
      learningSamples: learningSamples || [],
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Parse expense error:', error)
    return NextResponse.json(
      { error: 'Failed to parse expense' },
      { status: 500 }
    )
  }
}
