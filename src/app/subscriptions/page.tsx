/**
 * Subscriptions Page
 * US-010: 訂閱記錄與管理
 * US-011: 帳單提醒
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/widgets/Header/Header'
import { SubscriptionList } from '@/features/subscriptions/components/SubscriptionList'

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <SubscriptionList />
      </main>
    </div>
  )
}
