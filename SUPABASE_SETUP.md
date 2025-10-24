# Supabase 數據庫設置指南

## 📋 概述

此文檔將指導您如何在 Supabase 中設置 QuickSmart 智能記帳應用所需的數據庫架構。

## 🚀 設置步驟

### 步驟 1: 登入 Supabase Dashboard

1. 訪問 [https://supabase.com](https://supabase.com)
2. 登入您的帳戶
3. 選擇您的項目（或創建新項目）

### 步驟 2: 執行 SQL 腳本

1. 在左側菜單中，點擊 **SQL Editor** (SQL 編輯器)
2. 點擊 **New Query** (新查詢)
3. 打開本地文件 `supabase-schema.sql`
4. 複製整個文件內容
5. 粘貼到 Supabase SQL Editor 中
6. 點擊 **Run** (執行) 按鈕
7. 等待執行完成，確認沒有錯誤

### 步驟 3: 驗證表已創建

1. 在左側菜單中，點擊 **Table Editor** (表編輯器)
2. 確認以下表已成功創建：
   - ✅ `user_profiles`
   - ✅ `expenses`
   - ✅ `subscriptions`
   - ✅ `ai_learning_samples`
   - ✅ `notifications`
   - ✅ `analytics_cache`

### 步驟 4: 配置環境變數

確保您的 `.env.local` 文件包含正確的 Supabase 配置：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (用於 AI 記帳解析)
OPENAI_API_KEY=your_openai_api_key
```

**如何獲取 Supabase 憑證：**
1. 在 Supabase Dashboard 中，點擊 **Settings** (設置)
2. 點擊 **API**
3. 複製以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 數據庫架構說明

### 1. User Profiles (用戶資料)
- 存儲用戶的個人資料和偏好設置
- 自動在用戶註冊時創建

### 2. Expenses (支出記錄)
- 存儲所有交易記錄
- 支持 AI 解析的自然語言輸入
- 包含分類、標籤、商家等信息

### 3. Subscriptions (訂閱管理)
- 管理定期訂閱服務
- 自動計算下次扣款日期
- 支持提醒功能

### 4. AI Learning Samples (AI 學習樣本)
- 存儲 AI 解析的原始輸入和結果
- 用於持續改進 AI 準確性

### 5. Notifications (通知)
- 訂閱提醒通知
- 異常消費警告
- 系統通知

### 6. Analytics Cache (分析緩存)
- 緩存複雜的分析查詢結果
- 提高應用性能

## 🔒 安全功能

### Row Level Security (RLS)
所有表都啟用了行級安全性，確保：
- 用戶只能查看和修改自己的數據
- 數據完全隔離，防止越權訪問

### 自動觸發器
- **自動更新時間戳** - 每次更新記錄時自動更新 `updated_at`
- **自動創建用戶資料** - 新用戶註冊時自動創建 profile

## 📈 分析視圖

已創建兩個分析視圖：
1. **monthly_expense_summary** - 月度支出摘要
2. **category_breakdown** - 分類支出統計

## ⚙️ 維護功能

### 清理過期緩存
定期執行以下 SQL 清理過期的分析緩存：

```sql
SELECT public.clean_expired_cache();
```

建議設置 Supabase Cron Job 每天執行一次。

## 🧪 測試數據庫連接

設置完成後，重啟開發服務器：

```bash
npm run dev
```

然後嘗試：
1. 註冊新用戶
2. 登入
3. 添加支出記錄
4. 創建訂閱

如果一切正常，您應該不會再看到 `table not found` 錯誤。

## ❓ 常見問題

### Q: 執行 SQL 時出現權限錯誤
**A:** 確保您使用的是項目 Owner 帳戶，並且在正確的項目中執行。

### Q: 表已存在的錯誤
**A:** SQL 腳本使用了 `IF NOT EXISTS`，可以安全重複執行。如果需要重建，先刪除舊表。

### Q: RLS 策略衝突
**A:** 腳本會自動處理。如果有問題，可以在 Table Editor 中手動檢查和修改策略。

## 📞 需要幫助？

如果遇到任何問題，請檢查：
1. Supabase Dashboard 的 Logs (日誌)
2. 瀏覽器 Console 的錯誤信息
3. 開發服務器的終端輸出

## ✅ 完成檢查清單

- [ ] Supabase 項目已創建
- [ ] SQL 腳本已執行成功
- [ ] 6 個表已創建並可見
- [ ] `.env.local` 已配置正確的憑證
- [ ] 開發服務器已重啟
- [ ] 可以成功註冊和登入
- [ ] 沒有 "table not found" 錯誤

---

**恭喜！您的 QuickSmart 智能記帳數據庫已設置完成！** 🎉
