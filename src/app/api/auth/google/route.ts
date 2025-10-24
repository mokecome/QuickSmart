/**
 * Google OAuth Login API Route
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the origin for redirect URL
    const origin = request.nextUrl.origin

    // Sign in with Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/api/auth/callback`,
      },
    })

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (data.url) {
      return NextResponse.redirect(data.url)
    }

    return NextResponse.redirect(`${origin}/login`)
  } catch (error) {
    console.error('Google OAuth error:', error)
    const origin = request.nextUrl.origin
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }
}
