# QuickSmart 智慧記帳 - 環境配置文件

## 📋 目錄
- [環境變數清單](#環境變數清單)
- [開發環境設定](#開發環境設定)
- [Staging 環境設定](#staging-環境設定)
- [Production 環境設定](#production-環境設定)
- [環境變數管理](#環境變數管理)
- [服務配置指南](#服務配置指南)

---

## 🔐 環境變數清單

### 必要變數（所有環境）

| 變數名稱 | 說明 | 範例 | 敏感性 |
|---------|------|------|--------|
| `DATABASE_URL` | PostgreSQL 連線字串 | `postgresql://user:pass@host:5432/db` | 🔴 高 |
| `NEXTAUTH_URL` | NextAuth.js 基礎 URL | `https://quicksmart.app` | 🟢 低 |
| `NEXTAUTH_SECRET` | NextAuth.js 加密金鑰 | `openssl rand -base64 32` | 🔴 高 |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` | 🟡 中 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `GOCSPX-xxxxx` | 🔴 高 |
| `CLAUDE_API_KEY` | Anthropic Claude API Key | `sk-ant-xxxxx` | 🔴 高 |
| `ENCRYPTION_KEY` | 資料庫欄位加密金鑰 | `openssl rand -hex 32` | 🔴 高 |

### 可選變數

| 變數名稱 | 說明 | 預設值 | 用途 |
|---------|------|--------|------|
| `UPSTASH_REDIS_URL` | Upstash Redis URL | - | Rate Limiting |
| `UPSTASH_REDIS_TOKEN` | Upstash Redis Token | - | Rate Limiting |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN（公開） | - | 錯誤追蹤 |
| `SENTRY_AUTH_TOKEN` | Sentry Auth Token | - | Source Maps 上傳 |
| `SENTRY_ENV` | Sentry 環境標籤 | `development` | 錯誤分類 |
| `NODE_ENV` | Node.js 環境 | `development` | 框架行為 |
| `LOG_LEVEL` | 日誌等級 | `info` | `debug` / `info` / `warn` / `error` |

---

## 💻 開發環境設定

### .env.local（本地開發）

```bash
# ===========================
# 資料庫（Docker PostgreSQL）
# ===========================
DATABASE_URL="postgresql://postgres:password@localhost:5432/quicksmart_dev"

# ===========================
# NextAuth.js
# ===========================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"  # 開發用，不需太複雜

# ===========================
# Google OAuth（開發專用）
# ===========================
# 取得方式：https://console.cloud.google.com/
# 1. 建立專案 "QuickSmart Dev"
# 2. 啟用 Google+ API
# 3. 建立 OAuth 2.0 Client ID
# 4. 授權重新導向 URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID="your-dev-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-dev-secret"

# ===========================
# Claude AI（測試 API Key）
# ===========================
# 取得方式：https://console.anthropic.com/
# 使用測試額度或個人 API Key
CLAUDE_API_KEY="sk-ant-api03-your-test-key"

# ===========================
# Upstash Redis（開發環境）
# ===========================
# 取得方式：https://console.upstash.com/
# 建立免費 Database（10k 請求/日）
UPSTASH_REDIS_URL="https://your-dev-redis.upstash.io"
UPSTASH_REDIS_TOKEN="your-dev-token"

# ===========================
# 資料加密（開發金鑰）
# ===========================
# 生成方式：openssl rand -hex 32
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# ===========================
# Sentry（可選，開發時可關閉）
# ===========================
# NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
# SENTRY_ENV="development"

# ===========================
# 其他設定
# ===========================
NODE_ENV="development"
LOG_LEVEL="debug"  # 開發時顯示詳細日誌
```

### Docker Compose（本地資料庫）

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: quicksmart-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: quicksmart_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: quicksmart-redis
    ports:
      - "6379:6379"
    # 如果不使用 Upstash，可用本地 Redis 測試

volumes:
  postgres_data:
```

**啟動本地資料庫：**
```bash
docker-compose up -d
```

---

## 🧪 Staging 環境設定

### Vercel Environment Variables（Staging）

**設定位置：**
```
Vercel Dashboard → quicksmart → Settings → Environment Variables
→ 選擇 Environment: Preview
```

**變數配置：**

```bash
# ===========================
# 資料庫（Supabase Staging）
# ===========================
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# ===========================
# NextAuth.js
# ===========================
NEXTAUTH_URL="https://quicksmart-staging.vercel.app"
NEXTAUTH_SECRET="[生成新的 Secret：openssl rand -base64 32]"

# ===========================
# Google OAuth（Staging 專用）
# ===========================
# 建議建立獨立的 OAuth Client（與 Dev 分開）
# 授權重新導向 URI: https://quicksmart-staging.vercel.app/api/auth/callback/google
GOOGLE_CLIENT_ID="your-staging-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-staging-secret"

# ===========================
# Claude AI（測試 API Key）
# ===========================
CLAUDE_API_KEY="sk-ant-api03-your-test-key"

# ===========================
# Upstash Redis（Staging）
# ===========================
# 建議建立獨立的 Redis Instance
UPSTASH_REDIS_URL="https://your-staging-redis.upstash.io"
UPSTASH_REDIS_TOKEN="your-staging-token"

# ===========================
# 資料加密（Staging 金鑰）
# ===========================
# ⚠️ 與 Production 不同！
ENCRYPTION_KEY="[生成新的金鑰：openssl rand -hex 32]"

# ===========================
# Sentry
# ===========================
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
SENTRY_ENV="staging"

# ===========================
# 其他設定
# ===========================
NODE_ENV="production"  # Staging 也用 production mode
LOG_LEVEL="info"
```

### Supabase Staging 設定

**建立 Staging Project：**
```
Supabase Dashboard → New Project
Name: quicksmart-staging
Region: Tokyo (ap-northeast-1)
Database Password: [強密碼]
```

**執行 Prisma Migration：**
```bash
# 本地執行
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres" \
npx prisma migrate deploy
```

---

## 🚀 Production 環境設定

### Vercel Environment Variables（Production）

**設定位置：**
```
Vercel Dashboard → quicksmart → Settings → Environment Variables
→ 選擇 Environment: Production
```

**變數配置：**

```bash
# ===========================
# 資料庫（Supabase Production）
# ===========================
DATABASE_URL="postgresql://postgres:[STRONG_PASSWORD]@db.xxx.supabase.co:5432/postgres"

# ⚠️ 重要：使用 Connection Pooling URL（提升效能）
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true"

# ===========================
# NextAuth.js
# ===========================
NEXTAUTH_URL="https://quicksmart.app"
NEXTAUTH_SECRET="[生成高強度 Secret：openssl rand -base64 64]"

# ===========================
# Google OAuth（Production）
# ===========================
# 授權重新導向 URI: https://quicksmart.app/api/auth/callback/google
GOOGLE_CLIENT_ID="your-production-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-production-secret"

# ===========================
# Claude AI（Production API Key）
# ===========================
# ⚠️ 使用獨立的 Production Key，監控用量
CLAUDE_API_KEY="sk-ant-api03-your-production-key"

# ===========================
# Upstash Redis（Production）
# ===========================
# 使用 Pay-as-you-go Plan（更高效能）
UPSTASH_REDIS_URL="https://your-production-redis.upstash.io"
UPSTASH_REDIS_TOKEN="your-production-token"

# ===========================
# 資料加密（Production 金鑰）
# ===========================
# ⚠️ 極度重要：使用高強度金鑰，永久保存（丟失無法解密）
ENCRYPTION_KEY="[生成 256-bit 金鑰：openssl rand -hex 32]"

# ===========================
# Sentry
# ===========================
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
SENTRY_ENV="production"

# ===========================
# 其他設定
# ===========================
NODE_ENV="production"
LOG_LEVEL="warn"  # Production 只記錄警告與錯誤

# ===========================
# 效能優化（可選）
# ===========================
NEXT_TELEMETRY_DISABLED="1"  # 禁用 Next.js 遙測
```

### 金鑰管理最佳實踐

#### ENCRYPTION_KEY 保護

**⚠️ 極度重要：此金鑰用於加密資料庫敏感欄位（description），丟失將無法解密！**

```bash
# 1. 生成金鑰（僅一次）
openssl rand -hex 32 > encryption.key

# 2. 安全儲存（三個位置）
# - Vercel Dashboard（Production Environment Variables）
# - 密碼管理器（1Password / Bitwarden）
# - 離線備份（加密 USB 隨身碟）

# 3. 定期輪換計畫（V2.0）
# - 生成新金鑰
# - 使用雙金鑰模式（舊資料用舊金鑰，新資料用新金鑰）
# - 背景任務重新加密舊資料
```

#### API Keys 輪換

**定期輪換（建議每 6 個月）：**
```bash
# 1. Claude API
# - Console → Settings → API Keys → Revoke & Create New

# 2. Google OAuth
# - Console → Credentials → Reset Secret

# 3. Upstash Redis
# - Console → Database → Settings → Reset Token
```

---

## 🔧 環境變數管理

### 本地開發（.env.local）

**範本檔案：**
```bash
# .env.example（提交到 Git）
DATABASE_URL="postgresql://postgres:password@localhost:5432/quicksmart_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
# ... 其他變數（移除實際值）
```

**使用方式：**
```bash
# 首次設定
cp .env.example .env.local

# 填入實際值（不提交到 Git）
# .gitignore 已包含 .env.local
```

### Vercel CLI（上傳環境變數）

**安裝 Vercel CLI：**
```bash
npm install -g vercel
vercel login
```

**上傳環境變數：**
```bash
# 從 .env 檔案上傳
vercel env pull .env.local  # 下載環境變數
vercel env add DATABASE_URL production  # 新增變數

# 或使用 Dashboard（推薦）
```

### 環境變數檢查腳本

**驗證必要變數：**
```typescript
// scripts/check-env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CLAUDE_API_KEY',
  'ENCRYPTION_KEY',
];

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingVars.length > 0) {
  console.error('❌ 缺少必要環境變數:');
  missingVars.forEach((varName) => console.error(`  - ${varName}`));
  process.exit(1);
}

console.log('✅ 所有必要環境變數已設定');
```

**在 CI/CD 中執行：**
```yaml
# .github/workflows/ci.yml
- name: Check Environment Variables
  run: npx ts-node scripts/check-env.ts
```

---

## 🛠️ 服務配置指南

### 1. Supabase（資料庫）

**建立 Project：**
```
1. 前往 https://supabase.com/dashboard
2. 點擊 "New Project"
3. 填寫資訊：
   - Name: quicksmart-production
   - Database Password: [強密碼 - 儲存於密碼管理器]
   - Region: Tokyo (ap-northeast-1)
4. 等待建立完成（約 2 分鐘）
```

**取得連線字串：**
```
Project Settings → Database → Connection String
→ URI: postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

**啟用 Connection Pooling（推薦）：**
```
Project Settings → Database → Connection Pooling
→ Mode: Transaction
→ URI: postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:6543/postgres?pgbouncer=true
```

### 2. Upstash Redis（Rate Limiting）

**建立 Database：**
```
1. 前往 https://console.upstash.com/
2. 點擊 "Create Database"
3. 選擇：
   - Name: quicksmart-production
   - Region: Tokyo (ap-northeast-1)
   - Type: Pay as you go（或 Free 用於測試）
4. 建立完成
```

**取得連線資訊：**
```
Database → quicksmart-production → Details
→ UPSTASH_REDIS_URL: https://xxx.upstash.io
→ UPSTASH_REDIS_TOKEN: xxxxx
```

### 3. Google OAuth

**建立 OAuth Client：**
```
1. 前往 https://console.cloud.google.com/
2. 選擇專案或建立新專案
3. 啟用 API：APIs & Services → Library → Google+ API → Enable
4. 建立憑證：
   - APIs & Services → Credentials
   - Create Credentials → OAuth Client ID
   - Application Type: Web application
   - Name: QuickSmart Production
   - Authorized redirect URIs:
     https://quicksmart.app/api/auth/callback/google
5. 儲存 Client ID 和 Client Secret
```

### 4. Claude API

**取得 API Key：**
```
1. 前往 https://console.anthropic.com/
2. 註冊帳號（需信用卡）
3. Settings → API Keys → Create Key
4. 儲存 API Key（僅顯示一次）
```

**監控用量：**
```
Console → Usage → 查看每日用量
設定警報：當用量超過 $50 時發送 Email
```

### 5. Sentry（錯誤追蹤）

**建立 Project：**
```
1. 前往 https://sentry.io/
2. Create Project
   - Platform: Next.js
   - Project Name: quicksmart
3. 取得 DSN
4. 建立 Auth Token（用於上傳 Source Maps）
   - Settings → Auth Tokens → Create New Token
   - Scopes: project:write
```

---

## 📋 環境配置檢查清單

### 開發環境

- [ ] Docker PostgreSQL 啟動正常
- [ ] `.env.local` 檔案建立並填寫
- [ ] Prisma Migration 執行成功
- [ ] `npm run dev` 啟動正常
- [ ] Google OAuth 登入測試成功
- [ ] Claude API 連線正常（記帳測試）

### Staging 環境

- [ ] Supabase Staging Project 建立
- [ ] Vercel Preview 環境變數設定完成
- [ ] Prisma Migration 部署到 Staging
- [ ] Staging 網址可訪問
- [ ] 功能測試通過（E2E）
- [ ] Sentry 錯誤追蹤正常

### Production 環境

- [ ] Supabase Production Project 建立
- [ ] Vercel Production 環境變數設定完成
- [ ] ENCRYPTION_KEY 已安全備份（三個位置）
- [ ] Google OAuth Production Client 建立
- [ ] Claude API Production Key 設定
- [ ] 自訂網域（quicksmart.app）設定完成
- [ ] SSL 憑證自動更新
- [ ] Sentry 告警設定完成
- [ ] 健康檢查端點（/api/health）正常

---

## 🔍 疑難排解

### 問題 1：DATABASE_URL 連線失敗

**錯誤訊息：**
```
Error: Can't reach database server at `db.xxx.supabase.co`
```

**解決方式：**
```bash
# 1. 檢查連線字串格式
echo $DATABASE_URL
# 應為：postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

# 2. 測試連線
psql $DATABASE_URL -c "SELECT 1"

# 3. 檢查 Supabase Project 是否暫停（Free Plan 會自動暫停）
# Dashboard → Project → 若顯示 "Paused"，點擊 "Restore"

# 4. 檢查 IP 白名單（若有設定）
# Project Settings → Database → Connection Pooling → Allow all IPs
```

### 問題 2：NEXTAUTH_SECRET 未設定

**錯誤訊息：**
```
[next-auth][error][NO_SECRET]
```

**解決方式：**
```bash
# 1. 生成 Secret
openssl rand -base64 32

# 2. 加入 .env.local
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local

# 3. 重啟開發伺服器
npm run dev
```

### 問題 3：Google OAuth 403 Error

**錯誤訊息：**
```
Error 403: redirect_uri_mismatch
```

**解決方式：**
```
1. 確認 NEXTAUTH_URL 正確
   - Development: http://localhost:3000
   - Production: https://quicksmart.app

2. 檢查 Google Console 授權重新導向 URI
   - 必須完全一致（包含 http/https）
   - 加上 /api/auth/callback/google

3. 等待 5-10 分鐘（Google 快取更新）
```

---

**文件版本：v1.0**
**最後更新：2025-10-20**
**維護者：DevOps 團隊**
