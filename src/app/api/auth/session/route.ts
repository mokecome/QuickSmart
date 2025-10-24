/**
 * Session Handler
 * Gets current user session
 * US-005: 用户注册与登入
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    )
  }

  if (!session) {
    return NextResponse.json(
      { error: 'No active session' },
      { status: 401 }
    )
  }

  return NextResponse.json({ session })
}
