/**
 * Subscription Pause Handler
 * Pauses or resumes a subscription
 * US-013: 訂閱取消與暫停
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body // 'pause' or 'resume'

  if (!action || !['pause', 'resume'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "pause" or "resume"' },
      { status: 400 }
    )
  }

  try {
    const newStatus = action === 'pause' ? 'PAUSED' : 'ACTIVE'

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription status:', error)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    console.error('Pause/resume subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
