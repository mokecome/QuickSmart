/**
 * Health Check Endpoint
 * Used for deployment verification and monitoring
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check database connection
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    // Check if OpenAI API key is configured
    const openaiConfigured = !!process.env.OPENAI_API_KEY

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: dbError ? 'unhealthy' : 'healthy',
        ai: openaiConfigured ? 'configured' : 'not_configured',
        environment: process.env.NODE_ENV,
      },
    }

    // Return 503 if any critical service is down
    if (dbError) {
      return NextResponse.json(
        { ...health, status: 'unhealthy' },
        { status: 503 }
      )
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}
