# 快速部署指南

最簡化的部署步驟，適合第一次部署或快速參考。

## ⚡ 5 分鐘快速部署

### 前置條件
- ✅ GitHub 帳號
- ✅ Vercel 帳號 (用 GitHub 登入)
- ✅ Supabase 帳號 (已有專案)
- ✅ OpenAI API Key

---

## 🚀 步驟 1: 推送代碼到 GitHub (2 分鐘)

```bash
cd "C:\Users\User\Desktop\新增資料夾\智能記帳"

# 初始化 Git (如果還沒有)
git init
git add .
git commit -m "Initial commit: Complete backend implementation"

# 創建 GitHub repository 並推送
# 方法 1: 使用 GitHub CLI
gh repo create quicksmart-accounting --public --source=. --push

# 方法 2: 手動
# 1. 在 GitHub 創建新 repository
# 2. 執行以下命令
git remote add origin https://github.com/YOUR_USERNAME/quicksmart-accounting.git
git branch -M main
git push -u origin main
```

---

## 🔧 步驟 2: 連接 Vercel (1 分鐘)

1. 前往 [Vercel Dashboard](https://vercel.com/new)
2. 點擊 **"Import Git Repository"**
3. 選擇剛才創建的 repository
4. 點擊 **"Import"**

### 配置構建設置
- Framework Preset: **Next.js** (自動檢測)
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `.next`

點擊 **"Deploy"** (先不配置環境變量，稍後設置)

---

## 🔐 步驟 3: 配置環境變量 (2 分鐘)

### 3.1 在 Vercel Dashboard 添加環境變量

前往: Project → Settings → Environment Variables

添加以下變量 (All Environments):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dckthwceyfngzpmyuybp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRja3Rod2NleWZuZ3pwbXl1eWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzczNjAsImV4cCI6MjA3NjgxMzM2MH0.dqT2vCXa3Vq6iaZgJf71VwpRhRXyi3tBZBlBY2l-wn8

# OpenAI
OPENAI_API_KEY=sk-YOUR_ACTUAL_API_KEY_HERE

# App URL
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**重要**: 替換 `OPENAI_API_KEY` 為您的真實 API Key!

### 3.2 重新部署

點擊 **"Redeploy"** 讓環境變量生效

---

## 🗄️ 步驟 4: 設置數據庫 (選做，如已設置可跳過)

### 方法 A: Supabase Dashboard (推薦)

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇專案: `dckthwceyfngzpmyuybp`
3. 點擊 **SQL Editor** → **New query**
4. 複製 `supabase/migrations/20250124000001_initial_schema.sql` 內容
5. 貼上並點擊 **Run**

### 方法 B: Supabase CLI

```bash
# 安裝 CLI
npm install -g supabase

# 登入
supabase login

# 連結專案
supabase link --project-ref dckthwceyfngzpmyuybp

# 執行遷移
supabase db push
```

---

## ✅ 驗證部署

### 檢查 1: 訪問網站
```
https://your-app-name.vercel.app
```

### 檢查 2: 健康端點
```bash
curl https://your-app-name.vercel.app/api/health
```

預期響應:
```json
{
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "ai": "configured"
  }
}
```

### 檢查 3: 測試快速記帳
1. 訪問首頁
2. 註冊/登入
3. 輸入 "午餐 150"
4. 確認 AI 解析正常

---

## 🎉 完成！

您的應用現在已經上線了！

- 🌐 網站: `https://your-app-name.vercel.app`
- 📊 Dashboard: [Vercel Dashboard](https://vercel.com/dashboard)
- 🗄️ 數據庫: [Supabase Dashboard](https://supabase.com/dashboard)

---

## 🔄 後續自動部署

現在每次推送到 `main` 分支都會自動部署:

```bash
# 修改代碼
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel 自動部署! 🚀
```

---

## 🤔 遇到問題？

### 常見問題

**Q: 部署失敗 "Build Error"**
```bash
# 本地測試構建
npm run build

# 檢查 TypeScript 錯誤
npm run type-check
```

**Q: API 返回 401/403**
- 檢查環境變量是否正確
- 確認 Supabase RLS policies 已啟用

**Q: AI 解析無法使用**
- 確認 `OPENAI_API_KEY` 已設置
- 檢查 API Key 是否有效
- 確認 OpenAI 帳號有足夠餘額

### 獲取幫助
- 📖 完整指南: `DEPLOYMENT_GUIDE.md`
- ✅ 檢查清單: `DEPLOYMENT_CHECKLIST.md`
- 📚 API 文檔: `API_DOCUMENTATION.md`

---

## 📱 可選: 設置自動化工作流

### GitHub Actions (進階)

如果想要完整的 CI/CD 流程:

1. **配置 GitHub Secrets**
   - Settings → Secrets → New repository secret
   - 添加 Vercel tokens (參考 `DEPLOYMENT_GUIDE.md`)

2. **GitHub Actions 自動觸發**
   - 已配置在 `.github/workflows/ci.yml`
   - 每次推送自動執行測試和部署

3. **Edge Functions 部署**
   ```bash
   # 部署 Supabase Functions
   supabase functions deploy subscription-billing-check
   supabase functions deploy anomaly-detection
   supabase functions deploy analytics-cache-refresh
   ```

---

**時間統計**:
- ⏱️ 推送代碼: 2 分鐘
- ⏱️ Vercel 設置: 1 分鐘
- ⏱️ 環境變量: 2 分鐘
- ⏱️ 數據庫 (選做): 5 分鐘
- **總計: 5-10 分鐘** ⚡

**準備好了嗎？開始部署吧！** 🚀
