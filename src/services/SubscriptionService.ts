/**
 * Subscription Service
 * Application layer service for subscription management
 * Implements business logic for US-010, US-011, US-012, US-013
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Subscription = Database['public']['Tables']['subscriptions']['Row']
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export class SubscriptionService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Create a new subscription
   * US-010: 訂閱記錄與管理
   */
  async createSubscription(
    userId: string,
    subscriptionData: Partial<SubscriptionInsert>
  ) {
    const subscription: SubscriptionInsert = {
      user_id: userId,
      name: subscriptionData.name!,
      amount: subscriptionData.amount!,
      billing_cycle: subscriptionData.billing_cycle || 'MONTHLY',
      next_billing_date: subscriptionData.next_billing_date!,
      reminder_days: subscriptionData.reminder_days || [3, 1, 0],
      status: 'ACTIVE',
      auto_record: subscriptionData.auto_record !== false,
      notes: subscriptionData.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await this.supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * List user subscriptions
   * US-010: 訂閱記錄與管理
   */
  async listSubscriptions(
    userId: string,
    options: {
      status?: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
      includeAll?: boolean
    } = {}
  ) {
    let query = this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true })

    if (options.status) {
      query = query.eq('status', options.status)
    } else if (!options.includeAll) {
      query = query.in('status', ['ACTIVE', 'PAUSED'])
    }

    const { data, error } = await query

    if (error) throw error
    return data
  }

  /**
   * Get subscription by ID
   * US-010: 訂閱記錄與管理
   */
  async getSubscriptionById(userId: string, subscriptionId: string) {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update subscription
   * US-012: 訂閱編輯
   */
  async updateSubscription(
    userId: string,
    subscriptionId: string,
    updates: Partial<SubscriptionUpdate>
  ) {
    const updateData: SubscriptionUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await this.supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Cancel subscription
   * US-013: 訂閱取消與暫停
   */
  async cancelSubscription(userId: string, subscriptionId: string) {
    return this.updateSubscription(userId, subscriptionId, {
      status: 'CANCELLED',
    })
  }

  /**
   * Pause subscription
   * US-013: 訂閱取消與暫停
   */
  async pauseSubscription(userId: string, subscriptionId: string) {
    return this.updateSubscription(userId, subscriptionId, {
      status: 'PAUSED',
    })
  }

  /**
   * Resume subscription
   * US-013: 訂閱取消與暫停
   */
  async resumeSubscription(userId: string, subscriptionId: string) {
    return this.updateSubscription(userId, subscriptionId, {
      status: 'ACTIVE',
    })
  }

  /**
   * Get upcoming billings
   * US-011: 帳單提醒
   */
  async getUpcomingBillings(userId: string, daysAhead: number = 30) {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .gte('next_billing_date', today.toISOString())
      .lte('next_billing_date', futureDate.toISOString())
      .order('next_billing_date', { ascending: true })

    if (error) throw error
    return data
  }

  /**
   * Calculate next billing date
   * US-010: 訂閱記錄與管理
   */
  calculateNextBillingDate(
    currentDate: Date,
    billingCycle: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  ): Date {
    const nextDate = new Date(currentDate)

    switch (billingCycle) {
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3)
        break
      case 'YEARLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1)
        break
    }

    return nextDate
  }

  /**
   * Process billing (auto-record expense)
   * US-010: 訂閱記錄與管理
   */
  async processBilling(subscriptionId: string) {
    // Get subscription
    const { data: subscription, error: subError } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) throw subError || new Error('Subscription not found')

    // Create expense if auto_record is enabled
    if (subscription.auto_record) {
      const { error: expenseError } = await this.supabase
        .from('expenses')
        .insert({
          user_id: subscription.user_id,
          amount: subscription.amount,
          category: 'SUBSCRIPTION',
          description: `${subscription.name} - 訂閱扣款`,
          date: new Date().toISOString(),
          version: 1,
          sync_status: 'SYNCED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (expenseError) {
        console.error('Failed to create expense:', expenseError)
      }
    }

    // Update next billing date
    const nextBillingDate = this.calculateNextBillingDate(
      new Date(subscription.next_billing_date),
      subscription.billing_cycle as 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
    )

    const { error: updateError } = await this.supabase
      .from('subscriptions')
      .update({
        next_billing_date: nextBillingDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)

    if (updateError) throw updateError

    return { success: true, nextBillingDate }
  }

  /**
   * Get subscription summary
   * US-010: 訂閱記錄與管理
   */
  async getSummary(userId: string) {
    const subscriptions = await this.listSubscriptions(userId, { includeAll: false })

    const activeSubscriptions = subscriptions.filter((sub: { status: string }) => sub.status === 'ACTIVE')
    const pausedSubscriptions = subscriptions.filter((sub: { status: string }) => sub.status === 'PAUSED')

    // Calculate monthly total
    const monthlyTotal = activeSubscriptions.reduce((total: number, sub: { amount: number; billing_cycle: string }) => {
      const amount = parseFloat(sub.amount.toString())
      switch (sub.billing_cycle) {
        case 'WEEKLY':
          return total + (amount * 52) / 12
        case 'MONTHLY':
          return total + amount
        case 'QUARTERLY':
          return total + amount / 3
        case 'YEARLY':
          return total + amount / 12
        default:
          return total
      }
    }, 0)

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      pausedSubscriptions: pausedSubscriptions.length,
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      yearlyTotal: Math.round(monthlyTotal * 12 * 100) / 100,
    }
  }
}
