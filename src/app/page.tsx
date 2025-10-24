/**
 * Home Page / Quick Expense Input
 * US-001: AI 自然語言解析
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExpenseInputForm } from '@/features/expenses/components/ExpenseInputForm'
import { RecentExpenses } from '@/features/expenses/components/RecentExpenses'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            QuickSmart 智能記帳
          </h1>
          <p className="mt-2 text-gray-600">
            輸入你的消費,AI 幫你分類
          </p>
        </header>

        {/* Quick Expense Input */}
        <section className="mb-8">
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
    </main>
  )
}
