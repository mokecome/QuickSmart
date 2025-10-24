/**
 * Sign Out Handler
 * Handles user sign out
 * US-005: 用户注册与登入
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
