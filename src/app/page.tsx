/**
 * Home Page / Quick Expense Input
 * US-001: AI 自然語言解析
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExpenseInputForm } from '@/features/expenses/components/ExpenseInputForm'
import { RecentExpenses } from '@/features/expenses/components/RecentExpenses'
import { MonthlyStats } from '@/features/insights/components/MonthlyStats'
import { Header } from '@/widgets/Header/Header'

export default async function HomePage() {
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
        <div className="grid gap-8 md:grid-cols-2">
          {/* Quick Expense Input */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              快速記帳
            </h2>
            <ExpenseInputForm />
          </section>

          {/* Recent Expenses */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              最近記錄
            </h2>
            <RecentExpenses />
          </section>
        </div>

        {/* Monthly Statistics Preview */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              本月概覽
            </h2>
            <Link
              href="/insights"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              查看完整分析 →
            </Link>
          </div>
          <MonthlyStats />
        </section>
      </main>
    </div>
  )
}
