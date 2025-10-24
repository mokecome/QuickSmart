-- =====================================================
-- 添加 expenses 表缺少的列
-- 在 Supabase SQL Editor 中執行此腳本
-- =====================================================

-- 添加 source 列
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'AI', 'IMPORT'));

-- 添加 metadata 列（如果不存在）
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 添加其他可能缺少的列
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3, 2);

ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS fallback_used BOOLEAN DEFAULT false;

-- 驗證所有列
DO $$
DECLARE
  has_source BOOLEAN;
  has_metadata BOOLEAN;
  has_ai_confidence BOOLEAN;
  has_fallback_used BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'source'
  ) INTO has_source;

  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'metadata'
  ) INTO has_metadata;

  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'ai_confidence'
  ) INTO has_ai_confidence;

  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'fallback_used'
  ) INTO has_fallback_used;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Column Check Results:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'source: %', CASE WHEN has_source THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE 'metadata: %', CASE WHEN has_metadata THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE 'ai_confidence: %', CASE WHEN has_ai_confidence THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE 'fallback_used: %', CASE WHEN has_fallback_used THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE '========================================';

  IF has_source AND has_metadata THEN
    RAISE NOTICE 'All required columns added successfully!';
    RAISE NOTICE 'You can now create expenses.';
  ELSE
    RAISE NOTICE 'Some columns are still missing. Please re-run the script.';
  END IF;
END $$;
