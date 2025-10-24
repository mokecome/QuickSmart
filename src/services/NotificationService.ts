/**
 * Notification Service
 * Application layer service for notification management
 * Implements business logic for US-015
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export class NotificationService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Create a notification
   * US-015: 智能提醒
   */
  async createNotification(
    userId: string,
    notification: Omit<NotificationInsert, 'user_id' | 'created_at'>
  ) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        related_id: notification.related_id || null,
        scheduled_for: notification.scheduled_for || null,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * List notifications
   * US-015: 智能提醒
   */
  async listNotifications(
    userId: string,
    options: {
      page?: number
      limit?: number
      unreadOnly?: boolean
    } = {}
  ) {
    const { page = 1, limit = 20, unreadOnly = false } = options
    const offset = (page - 1) * limit

    let query = this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data, error, count } = await query

    if (error) throw error

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  }

  /**
   * Mark notification as read
   * US-015: 智能提醒
   */
  async markAsRead(userId: string, notificationId: string) {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Mark all notifications as read
   * US-015: 智能提醒
   */
  async markAllAsRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return { success: true }
  }

  /**
   * Get unread count
   * US-015: 智能提醒
   */
  async getUnreadCount(userId: string) {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  }

  /**
   * Create subscription billing reminder
   * US-011: 帳單提醒
   */
  async createSubscriptionReminder(
    userId: string,
    subscriptionId: string,
    subscriptionName: string,
    amount: number,
    billingDate: Date,
    daysBeforeBilling: number
  ) {
    const scheduledFor = new Date(billingDate)
    scheduledFor.setDate(scheduledFor.getDate() - daysBeforeBilling)

    let title = ''
    let message = ''

    if (daysBeforeBilling === 0) {
      title = '訂閱即將扣款'
      message = `您的 ${subscriptionName} 訂閱今天將扣款 $${amount}`
    } else if (daysBeforeBilling === 1) {
      title = '訂閱扣款提醒'
      message = `您的 ${subscriptionName} 訂閱明天將扣款 $${amount}`
    } else {
      title = '訂閱扣款提醒'
      message = `您的 ${subscriptionName} 訂閱將在 ${daysBeforeBilling} 天後扣款 $${amount}`
    }

    return this.createNotification(userId, {
      type: 'SUBSCRIPTION_REMINDER',
      title,
      message,
      related_id: subscriptionId,
      scheduled_for: scheduledFor.toISOString(),
    })
  }

  /**
   * Create anomaly detection notification
   * US-021: 異常消費偵測
   */
  async createAnomalyNotification(
    userId: string,
    expenseId: string,
    amount: number,
    category: string,
    expectedAmount: number
  ) {
    const deviation = Math.round((amount - expectedAmount) * 100) / 100
    const percentChange = Math.round((deviation / expectedAmount) * 100)

    return this.createNotification(userId, {
      type: 'ANOMALY_DETECTED',
      title: '檢測到異常消費',
      message: `您在 ${category} 類別的消費 $${amount} 比平均值 $${expectedAmount} 高出 ${percentChange}%`,
      related_id: expenseId,
      scheduled_for: null,
    })
  }

  /**
   * Create budget alert notification
   * US-022: 預算警告
   */
  async createBudgetAlert(
    userId: string,
    category: string,
    spent: number,
    budget: number,
    percentage: number
  ) {
    let title = ''
    let message = ''

    if (percentage >= 100) {
      title = '預算已超支'
      message = `您的 ${category} 類別本月已超支!目前花費 $${spent},預算為 $${budget}`
    } else if (percentage >= 90) {
      title = '預算即將超支'
      message = `您的 ${category} 類別已使用 ${percentage}% 的預算,請注意控制開支`
    } else if (percentage >= 80) {
      title = '預算警告'
      message = `您的 ${category} 類別已使用 ${percentage}% 的預算`
    }

    return this.createNotification(userId, {
      type: 'BUDGET_ALERT',
      title,
      message,
      related_id: null,
      scheduled_for: null,
    })
  }
}
