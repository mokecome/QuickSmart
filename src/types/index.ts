/**
 * Core Application Types
 */

export type ExpenseCategory =
  | 'FOOD'
  | 'TRANSPORT'
  | 'ENTERTAINMENT'
  | 'SHOPPING'
  | 'HOUSING'
  | 'MEDICAL'
  | 'EDUCATION'
  | 'SUBSCRIPTION'
  | 'OTHER'
  | 'INCOME'

export type ExpenseSource = 'MANUAL' | 'SUBSCRIPTION' | 'TELEGRAM'

export type SyncStatus = 'SYNCED' | 'PENDING' | 'CONFLICT' | 'FAILED'

export type BillingCycle = 'MONTHLY' | 'YEARLY'

export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED'

export type NotificationType =
  | 'SUBSCRIPTION_REMINDER'
  | 'DAILY_SUMMARY'
  | 'WEEKLY_REPORT'
  | 'MONTHLY_INSIGHTS'
  | 'ANOMALY_ALERT'
  | 'ANOMALY_DETECTED'
  | 'BUDGET_ALERT'

export type NotificationChannel = 'EMAIL' | 'PUSH' | 'TELEGRAM'

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED'

// Domain Models
export interface Expense {
  id: string
  userId: string
  amount: number
  category: ExpenseCategory
  description: string | null
  date: Date
  source: ExpenseSource
  aiConfidence: number | null
  fallbackUsed: boolean
  version: number
  syncStatus: SyncStatus
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface Subscription {
  id: string
  userId: string
  name: string
  amount: number
  category: string
  billingCycle: BillingCycle
  nextBillingDate: Date
  notificationDays: number[]
  autoRecord: boolean
  status: SubscriptionStatus
  reminderSentFor: Date[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface UserProfile {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  defaultCurrency: string
  telegramId: number | null
  telegramUsername: string | null
  notificationEnabled: boolean
  notificationTime: string
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, any> | null
  channel: NotificationChannel
  status: NotificationStatus
  sentAt: Date | null
  createdAt: Date
}

export interface AILearningSample {
  id: string
  userId: string
  originalInput: string
  correctedCategory: ExpenseCategory
  correctedAmount: number | null
  correctedDescription: string | null
  aiSuggestedCategory: ExpenseCategory | null
  aiConfidence: number | null
  createdAt: Date
}

export interface MonthlyAnalytics {
  id: string
  userId: string
  month: Date
  totalExpenses: number
  totalIncome: number
  categoryBreakdown: Record<ExpenseCategory, number>
  insights: AIInsight[]
  computedAt: Date
}

export interface AIInsight {
  type: 'SPENDING_TREND' | 'ANOMALY' | 'SUGGESTION' | 'COMPARISON'
  title: string
  message: string
  severity: 'INFO' | 'WARNING' | 'ALERT'
  data?: Record<string, any>
}

// API Request/Response Types
export interface ParseExpenseRequest {
  input: string
}

export interface ParseExpenseResponse {
  amount: number
  category: ExpenseCategory
  description: string
  confidence: number
  fallbackUsed: boolean
}

export interface CreateExpenseRequest {
  amount: number
  category: ExpenseCategory
  description?: string
  date?: string
}

export interface UpdateExpenseRequest {
  amount?: number
  category?: ExpenseCategory
  description?: string
  date?: string
}

export interface CreateSubscriptionRequest {
  name: string
  amount: number
  category?: string
  billingCycle: BillingCycle
  nextBillingDate: string
  notificationDays?: number[]
  autoRecord?: boolean
}

export interface UpdateSubscriptionRequest {
  name?: string
  amount?: number
  category?: string
  billingCycle?: BillingCycle
  nextBillingDate?: string
  notificationDays?: number[]
  autoRecord?: boolean
  status?: SubscriptionStatus
}

export interface MonthlyStatsResponse {
  totalExpenses: number
  totalIncome: number
  categoryBreakdown: Record<ExpenseCategory, number>
  transactionCount: number
  averageTransaction: number
  topCategories: Array<{
    category: ExpenseCategory
    amount: number
    percentage: number
  }>
}

export interface AIInsightsResponse {
  insights: AIInsight[]
  generatedAt: Date
}

// UI State Types
export interface ExpenseFormState {
  input: string
  isLoading: boolean
  isParsing: boolean
  parsedData: ParseExpenseResponse | null
  error: string | null
}

export interface SubscriptionFormState {
  name: string
  amount: string
  category: string
  billingCycle: BillingCycle
  nextBillingDate: string
  notificationDays: number[]
  autoRecord: boolean
  isSubmitting: boolean
  error: string | null
}

// Utility Types
export type ApiResponse<T> = {
  data: T
  error: null
} | {
  data: null
  error: {
    message: string
    code?: string
  }
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
