'use client'

/**
 * Recent Expenses List Component
 * Displays the user's recent expense records
 */

import { ExpenseList } from './ExpenseList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function RecentExpenses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近記帳</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseList />
      </CardContent>
    </Card>
  )
}
