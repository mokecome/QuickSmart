/**
 * Subscription API Client
 * API calls for subscription management
 */

export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED'

export interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number
  billing_cycle: BillingCycle
  next_billing_date: string
  reminder_days: number[]
  status: SubscriptionStatus
  auto_record: boolean
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionRequest {
  name: string
  amount: number
  billing_cycle: BillingCycle
  next_billing_date: string
  reminder_days?: number[]
  auto_record?: boolean
}

export interface UpdateSubscriptionRequest {
  name?: string
  amount?: number
  billing_cycle?: BillingCycle
  next_billing_date?: string
  reminder_days?: number[]
  auto_record?: boolean
}

export interface SubscriptionSummary {
  total_monthly: number
  total_yearly: number
  active_count: number
  subscriptions: Subscription[]
}

/**
 * Get all subscriptions
 */
export async function getSubscriptions(): Promise<Subscription[]> {
  const response = await fetch('/api/subscriptions')

  if (!response.ok) {
    throw new Error('獲取訂閱列表失敗')
  }

  const data = await response.json()
  return data.subscriptions || []
}

/**
 * Get subscription by ID
 */
export async function getSubscription(id: string): Promise<Subscription> {
  const response = await fetch(`/api/subscriptions/${id}`)

  if (!response.ok) {
    throw new Error('獲取訂閱詳情失敗')
  }

  return response.json()
}

/**
 * Create new subscription
 */
export async function createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '創建訂閱失敗')
  }

  return response.json()
}

/**
 * Update subscription
 */
export async function updateSubscription(
  id: string,
  data: UpdateSubscriptionRequest
): Promise<Subscription> {
  const response = await fetch(`/api/subscriptions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '更新訂閱失敗')
  }

  return response.json()
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(id: string): Promise<void> {
  const response = await fetch(`/api/subscriptions/${id}/cancel`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('取消訂閱失敗')
  }
}

/**
 * Pause subscription
 */
export async function pauseSubscription(id: string): Promise<void> {
  const response = await fetch(`/api/subscriptions/${id}/pause`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('暫停訂閱失敗')
  }
}

/**
 * Get subscription summary
 */
export async function getSubscriptionSummary(): Promise<SubscriptionSummary> {
  const response = await fetch('/api/subscriptions/summary')

  if (!response.ok) {
    throw new Error('獲取訂閱摘要失敗')
  }

  return response.json()
}
