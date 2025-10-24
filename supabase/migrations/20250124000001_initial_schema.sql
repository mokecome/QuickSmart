-- ============================================
-- QuickSmart 智能記帳 - Initial Database Schema
-- Version: 1.0
-- Date: 2025-01-24
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  default_currency VARCHAR(3) DEFAULT 'TWD',
  telegram_id BIGINT UNIQUE,
  telegram_username VARCHAR(100),
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. EXPENSES TABLE
-- ============================================
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING',
    'HOUSING', 'MEDICAL', 'EDUCATION', 'SUBSCRIPTION',
    'OTHER', 'INCOME'
  )),
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  source VARCHAR(20) DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'SUBSCRIPTION', 'TELEGRAM')),
  ai_confidence INTEGER CHECK (ai_confidence BETWEEN 0 AND 100),
  fallback_used BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  sync_status VARCHAR(20) DEFAULT 'SYNCED' CHECK (sync_status IN ('SYNCED', 'PENDING', 'CONFLICT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Index for common queries
  CONSTRAINT expenses_user_date_idx UNIQUE (user_id, id)
);

-- Indexes for performance
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_created_at ON public.expenses(created_at DESC);

-- Row Level Security for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) DEFAULT 'SUBSCRIPTION',
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
  next_billing_date DATE NOT NULL,
  notification_days INTEGER[] DEFAULT ARRAY[3, 1, 0],
  auto_record BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED')),
  reminder_sent_for JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_billing ON public.subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Row Level Security for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. AI LEARNING SAMPLES TABLE
-- ============================================
CREATE TABLE public.ai_learning_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_input TEXT NOT NULL,
  corrected_category VARCHAR(50) NOT NULL,
  corrected_amount DECIMAL(10, 2),
  corrected_description TEXT,
  ai_suggested_category VARCHAR(50),
  ai_confidence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for AI learning
CREATE INDEX idx_ai_samples_user_id ON public.ai_learning_samples(user_id);
CREATE INDEX idx_ai_samples_created_at ON public.ai_learning_samples(created_at DESC);

-- Row Level Security for ai_learning_samples
ALTER TABLE public.ai_learning_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning samples"
  ON public.ai_learning_samples FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning samples"
  ON public.ai_learning_samples FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'SUBSCRIPTION_REMINDER',
    'DAILY_SUMMARY',
    'WEEKLY_REPORT',
    'MONTHLY_INSIGHTS',
    'ANOMALY_ALERT'
  )),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('EMAIL', 'PUSH', 'TELEGRAM')),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Row Level Security for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 6. ANALYTICS CACHE TABLE (for performance)
-- ============================================
CREATE TABLE public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_expenses DECIMAL(12, 2) DEFAULT 0,
  total_income DECIMAL(12, 2) DEFAULT 0,
  category_breakdown JSONB,
  insights JSONB,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, month)
);

-- Index for analytics
CREATE INDEX idx_analytics_user_month ON public.analytics_cache(user_id, month DESC);

-- Row Level Security for analytics_cache
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON public.analytics_cache FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================

-- Function to calculate monthly statistics
CREATE OR REPLACE FUNCTION calculate_monthly_stats(
  p_user_id UUID,
  p_month DATE
)
RETURNS TABLE(
  total_expenses DECIMAL,
  total_income DECIMAL,
  category_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN category != 'INCOME' THEN amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN category = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
    jsonb_object_agg(category, cat_total) as category_breakdown
  FROM (
    SELECT
      category,
      SUM(amount) as cat_total
    FROM public.expenses
    WHERE user_id = p_user_id
      AND date >= date_trunc('month', p_month)
      AND date < date_trunc('month', p_month) + INTERVAL '1 month'
      AND deleted_at IS NULL
    GROUP BY category
  ) category_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA FOR DEVELOPMENT
-- ============================================

-- Insert default categories (can be customized per user)
COMMENT ON TABLE public.expenses IS 'Stores all user expense and income records with AI parsing metadata';
COMMENT ON TABLE public.subscriptions IS 'Manages recurring subscription payments with automated billing reminders';
COMMENT ON TABLE public.ai_learning_samples IS 'Stores user corrections to improve AI parsing accuracy over time';
COMMENT ON TABLE public.notifications IS 'Queue for all user notifications across multiple channels';
COMMENT ON TABLE public.analytics_cache IS 'Cached monthly analytics to improve dashboard performance';

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant authenticated users access to their own data
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant service role full access (for Edge Functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

COMMIT;
