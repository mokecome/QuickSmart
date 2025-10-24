/**
 * Expense Correction Handler
 * Saves user corrections for AI learning
 * US-003: 個人化學習與修正
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { originalInput, originalCategory, correctedCategory, expenseId } = body

  // Validate required fields
  if (!originalInput || !originalCategory || !correctedCategory) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    // Save learning sample
    const { data: learningSample, error: insertError } = await supabase
      .from('ai_learning_samples')
      .insert({
        user_id: user.id,
        original_input: originalInput,
        original_category: originalCategory,
        corrected_category: correctedCategory,
        expense_id: expenseId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving learning sample:', insertError)
      return NextResponse.json(
        { error: 'Failed to save correction' },
        { status: 500 }
      )
    }

    // Update the expense if expenseId provided
    if (expenseId) {
      const { error: updateError } = await supabase
        .from('expenses')
        .update({ category: correctedCategory })
        .eq('id', expenseId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating expense:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      data: learningSample,
    })
  } catch (error) {
    console.error('Correction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
