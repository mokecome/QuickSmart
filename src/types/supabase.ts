/**
 * Supabase Database Types
 * Auto-generated types for type-safe database queries
 * Run: npm run supabase:types to regenerate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          default_currency: string
          telegram_id: number | null
          telegram_username: string | null
          notification_enabled: boolean
          notification_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          telegram_id?: number | null
          telegram_username?: string | null
          notification_enabled?: boolean
          notification_time?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          default_currency?: string
          telegram_id?: number | null
          telegram_username?: string | null
          notification_enabled?: boolean
          notification_time?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          description: string | null
          date: string
          source: string
          ai_confidence: number | null
          fallback_used: boolean
          version: number
          sync_status: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          description?: string | null
          date: string
          source?: string
          ai_confidence?: number | null
          fallback_used?: boolean
          version?: number
          sync_status?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          description?: string | null
          date?: string
          source?: string
          ai_confidence?: number | null
          fallback_used?: boolean
          version?: number
          sync_status?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          category: string
          billing_cycle: string
          next_billing_date: string
          notification_days: number[]
          reminder_days: number[]
          auto_record: boolean
          status: string
          reminder_sent_for: Json
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          category?: string
          billing_cycle: string
          next_billing_date: string
          notification_days?: number[]
          reminder_days?: number[]
          auto_record?: boolean
          status?: string
          reminder_sent_for?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          category?: string
          billing_cycle?: string
          next_billing_date?: string
          notification_days?: number[]
          reminder_days?: number[]
          auto_record?: boolean
          status?: string
          reminder_sent_for?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      ai_learning_samples: {
        Row: {
          id: string
          user_id: string
          original_input: string
          original_category: string
          corrected_category: string
          corrected_amount: number | null
          corrected_description: string | null
          ai_suggested_category: string | null
          ai_confidence: number | null
          expense_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_input: string
          original_category?: string
          corrected_category: string
          corrected_amount?: number | null
          corrected_description?: string | null
          ai_suggested_category?: string | null
          ai_confidence?: number | null
          expense_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_input?: string
          original_category?: string
          corrected_category?: string
          corrected_amount?: number | null
          corrected_description?: string | null
          ai_suggested_category?: string | null
          ai_confidence?: number | null
          expense_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          channel: string
          status: string
          sent_at: string | null
          created_at: string
          related_id: string | null
          scheduled_for: string | null
          read: boolean
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          channel?: string
          status?: string
          sent_at?: string | null
          created_at?: string
          related_id?: string | null
          scheduled_for?: string | null
          read?: boolean
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          channel?: string
          status?: string
          sent_at?: string | null
          created_at?: string
          related_id?: string | null
          scheduled_for?: string | null
          read?: boolean
          read_at?: string | null
        }
        Relationships: []
      }
      analytics_cache: {
        Row: {
          id: string
          user_id: string
          cache_key: string
          cache_type: string
          data: Json
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cache_key: string
          cache_type: string
          data: Json
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cache_key?: string
          cache_type?: string
          data?: Json
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_monthly_stats: {
        Args: {
          p_user_id: string
          p_month: string
        }
        Returns: {
          total_expenses: number
          total_income: number
          category_breakdown: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
