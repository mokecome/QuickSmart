# QuickSmart 智能記帳 - 完整設置指南

這份指南將帶你從零開始設置整個專案,包含資料庫、AI 配置、前端設定等所有步驟。

## 📋 準備清單

在開始之前,請確保你已經準備好:

- ✅ Node.js 18+ 已安裝
- ✅ npm 9+ 已安裝
- ✅ Supabase 帳號 (已有專案 ID: `dckthwceyfngzpmyuybp`)
- ✅ OpenAI API Key (用於 GPT AI)
- ✅ Git 已安裝
- ✅ 程式編輯器 (推薦 VS Code)

## 🚀 步驟 1: 專案設置

### 1.1 確認專案位置

```bash
cd "C:\Users\User\Desktop\新增資料夾\智能記帳"
```

### 1.2 安裝依賴套件

```bash
npm install
```

預期輸出:
```
added 500+ packages in 30s
```

## 🗄️ 步驟 2: 資料庫設置

### 2.1 登入 Supabase Dashboard

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案 (Project Reference: `dckthwceyfngzpmyuybp`)
3. 專案 URL 應為: `https://dckthwceyfngzpmyuybp.supabase.co`

### 2.2 執行資料庫遷移

**方法 A: 使用 Dashboard (推薦初學者)**

1. 點擊左側導航欄的 **SQL Editor**
2. 點擊 **+ New query**
3. 打開專案中的檔案: `supabase/migrations/20250124000001_initial_schema.sql`
4. 複製全部內容
5. 貼上到 SQL Editor
6. 點擊 **Run** 執行

**方法 B: 使用 Supabase CLI (推薦開發者)**

```bash
# 安裝 Supabase CLI (如果還沒安裝)
npm install -g supabase

# 登入 Supabase
supabase login

# 連結專案
supabase link --project-ref dckthwceyfngzpmyuybp

# 執行遷移
supabase db push
```

### 2.3 驗證資料表建立成功

前往 **Table Editor**,確認以下資料表已建立:

| 資料表名稱 | 用途 | 欄位數 |
|-----------|------|--------|
| `user_profiles` | 用戶資料 | 11 |
| `expenses` | 消費記錄 | 14 |
| `subscriptions` | 訂閱管理 | 13 |
| `ai_learning_samples` | AI 學習樣本 | 8 |
| `notifications` | 通知記錄 | 9 |
| `analytics_cache` | 分析快取 | 8 |

### 2.4 檢查 Row Level Security (RLS)

1. 進入任一資料表 (例如 `expenses`)
2. 點擊右上角的 **⚙️ Settings**
3. 確認 **Enable Row Level Security** 已勾選
4. 點擊 **Policies** 標籤
5. 應該看到 4 個 policies:
   - Users can view their own expenses
   - Users can insert their own expenses
   - Users can update their own expenses
   - Users can delete their own expenses

## 🔐 步驟 3: 身份驗證設置

### 3.1 啟用 Email 登入

1. 前往 **Authentication** → **Providers**
2. 找到 **Email** provider
3. 確認已啟用 (開關為綠色)
4. 設定:
   - ✅ Enable Email provider
   - ✅ Confirm email (建議開發時關閉)
   - ✅ Secure email change (建議開啟)

### 3.2 設定 Google OAuth (選用)

1. 在 **Providers** 中找到 **Google**
2. 點擊 **Enable**
3. 前往 [Google Cloud Console](https://console.cloud.google.com/)
4. 建立 OAuth 2.0 憑證
5. 設定 Redirect URI:
   ```
   https://dckthwceyfngzpmyuybp.supabase.co/auth/v1/callback
   ```
6. 複製 Client ID 和 Client Secret 到 Supabase

### 3.3 配置 Site URL

1. 前往 **Authentication** → **URL Configuration**
2. 設定:
   - **Site URL**: `http://localhost:3000` (開發)
   - **Redirect URLs**:
     - `http://localhost:3000/auth/callback`
     - `https://your-domain.com/auth/callback` (正式環境)

## 🤖 步驟 4: OpenAI 設置

### 4.1 取得 API Key

1. 前往 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登入或註冊帳號
3. 點擊 **+ Create new secret key**
4. 輸入名稱 (例如: "QuickSmart Accounting")
5. 複製生成的 API Key (格式: `sk-...`)

### 4.2 配置環境變數

編輯 `.env.local` 檔案:

```env
# Supabase Configuration (已配置)
NEXT_PUBLIC_SUPABASE_URL=https://dckthwceyfngzpmyuybp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration (請替換)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**重要**: 將 `sk-your-actual-openai-api-key-here` 替換成你剛才複製的真實 API Key!

### 4.3 測試 AI 連線

```bash
# 啟動開發伺服器
npm run dev
```

前往 [http://localhost:3000](http://localhost:3000),輸入測試消費:
```
午餐 150
```

如果成功解析出:
- 金額: 150
- 分類: 飲食 (FOOD)
- 描述: 午餐

表示 AI 配置成功! 🎉

## 🎨 步驟 5: 前端設置 (已完成)

以下配置已自動完成:

- ✅ Tailwind CSS 配置
- ✅ TypeScript 配置
- ✅ Next.js 配置
- ✅ React Query Provider
- ✅ Supabase Client 設置

## 🧪 步驟 6: 測試設置

### 6.1 單元測試

```bash
npm run test
```

### 6.2 型別檢查

```bash
npm run type-check
```

預期輸出:
```
No errors found.
```

### 6.3 建置測試

```bash
npm run build
```

預期輸出:
```
✓ Compiled successfully
```

## 📱 步驟 7: 建立第一個測試用戶

### 7.1 啟動開發伺服器

```bash
npm run dev
```

### 7.2 註冊測試用戶

1. 前往 [http://localhost:3000](http://localhost:3000)
2. 如果顯示登入頁面,點擊「註冊」
3. 輸入測試 Email (例如: `test@example.com`)
4. 輸入密碼 (至少 6 位)
5. 點擊註冊

### 7.3 確認用戶建立

前往 Supabase Dashboard:
1. **Authentication** → **Users**
2. 應該看到剛才建立的用戶
3. 前往 **Table Editor** → `user_profiles`
4. 應該看到對應的用戶資料

## 🎯 步驟 8: 測試核心功能

### 8.1 測試快速記帳 (US-001)

輸入框測試:
```
午餐 150        → 飲食, 150, "午餐"
坐捷運 30 元     → 交通, 30, "捷運"
Netflix 390    → 訂閱, 390, "Netflix"
買咖啡 120      → 飲食, 120, "咖啡"
```

### 8.2 測試備用解析 (US-002)

暫時關閉 Claude AI (註解掉 API Key):

```env
# CLAUDE_API_KEY=sk-ant-...
```

重新載入頁面,輸入:
```
午餐 150
```

應該看到:
- ⚠️ 「使用備用解析」標記
- 信心度降低 (約 50%)
- 仍能正常解析

### 8.3 測試訂閱管理 (US-010)

功能尚未在前端實作,但可透過 API 測試:

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "amount": 390,
    "billingCycle": "MONTHLY",
    "nextBillingDate": "2025-02-01"
  }'
```

## 🔧 常見問題排除

### Q1: `npm install` 失敗

**症狀**: 安裝套件時出現錯誤

**解決方法**:
```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules
rm -rf node_modules package-lock.json

# 重新安裝
npm install
```

### Q2: 資料庫連線失敗

**症狀**: API 返回 401 或 403 錯誤

**檢查清單**:
1. ✅ `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 是否正確
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否正確
3. ✅ Supabase 專案是否已啟動 (非 paused 狀態)
4. ✅ RLS Policies 是否已正確建立

**驗證方法**:
```bash
# 測試 Supabase 連線
curl https://dckthwceyfngzpmyuybp.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"
```

### Q3: AI 解析失敗

**症狀**: 輸入消費後顯示「解析失敗」

**檢查清單**:
1. ✅ `OPENAI_API_KEY` 是否正確設置
2. ✅ API Key 是否有效 (未撤銷)
3. ✅ OpenAI 帳號是否有餘額

**測試 API Key**:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_OPENAI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

### Q4: 型別錯誤

**症狀**: TypeScript 編譯錯誤

**解決方法**:
```bash
# 重新生成 Supabase 型別
npm run supabase:types

# 重啟 TypeScript 伺服器 (VS Code)
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Q5: 開發伺服器無法啟動

**症狀**: `npm run dev` 失敗

**檢查**:
```bash
# 檢查 port 3000 是否被佔用
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# 使用其他 port
PORT=3001 npm run dev
```

## ✅ 設置完成檢查清單

完成以下所有項目表示設置成功:

### 資料庫 (Supabase)
- [ ] 6 個資料表已建立
- [ ] RLS Policies 已啟用
- [ ] Email 登入已啟用
- [ ] 測試用戶已建立

### AI 服務 (OpenAI)
- [ ] API Key 已配置
- [ ] 自然語言解析正常運作
- [ ] 備用解析機制正常

### 前端應用
- [ ] 依賴套件已安裝
- [ ] 型別檢查通過
- [ ] 建置成功
- [ ] 開發伺服器可正常運行

### 功能測試
- [ ] 用戶註冊/登入正常
- [ ] 快速記帳功能正常
- [ ] AI 解析準確
- [ ] 消費記錄顯示正常

## 🎉 下一步

設置完成後,你可以:

1. **開發新功能**:
   - 實作訂閱管理介面
   - 建立月度分析頁面
   - 加入 Telegram 通知

2. **閱讀文件**:
   - [Backend Architecture](./archite/backend-archite-doc.md)
   - [Frontend Architecture](./archite/frontend-archite-doc.md)
   - [User Stories](./docs/user_story.md)

3. **部署應用**:
   - 部署到 Vercel
   - 設定 Supabase Edge Functions
   - 配置正式環境變數

## 📞 需要協助?

- 📖 查看 [README.md](./README.md)
- 🐛 回報問題到 [GitHub Issues](https://github.com/quicksmart/issues)
- 💬 聯絡開發團隊: dev@quicksmart.app

---

**最後更新**: 2025-01-24
**版本**: 1.0.0
**狀態**: ✅ 設置指南完成
