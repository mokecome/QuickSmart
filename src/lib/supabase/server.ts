/**
 * Supabase Server Configuration
 * Provides server-side Supabase client for use in Server Components and API Routes
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export const createClient = async () => {
  const cookieStore = await cookies()

  // Get cookies as a string for auth
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          cookie: cookieString
        }
      },
      auth: {
        persistSession: false
      }
    }
  )
}
