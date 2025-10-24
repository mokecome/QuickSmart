/**
 * Insights Page
 * US-014: 月度帳單
 * US-020: 智能消費分析
 * US-021: 異常消費偵測
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/widgets/Header/Header'
import { MonthlyStats } from '@/features/insights/components/MonthlyStats'
import { CategoryBreakdown } from '@/features/insights/components/CategoryBreakdown'

export default async function InsightsPage() {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">智能分析</h1>
          <p className="text-gray-600 mt-2">
            深入了解您的消費習慣與財務狀況
          </p>
        </div>

        <div className="space-y-6">
          {/* Monthly Statistics */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              本月概覽
            </h2>
            <MonthlyStats />
          </section>

          {/* Category Breakdown */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              消費分布
            </h2>
            <CategoryBreakdown />
          </section>
        </div>
      </main>
    </div>
  )
}
