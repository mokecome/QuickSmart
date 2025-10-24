# QuickSmart 智慧記帳 - 部署流程文件

## 📋 目錄
- [環境架構](#環境架構)
- [部署前準備](#部署前準備)
- [Staging 環境部署](#staging-環境部署)
- [Production 環境部署](#production-環境部署)
- [資料庫遷移](#資料庫遷移)
- [監控與告警](#監控與告警)
- [回滾流程](#回滾流程)
- [故障排除](#故障排除)

---

## 🏗️ 環境架構

### 環境分層

```
┌─────────────────────────────────────────────────────┐
│ Development (本地)                                   │
│ - localhost:3000                                    │
│ - Docker PostgreSQL                                 │
│ - .env.local                                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Staging (測試)                                       │
│ - staging.quicksmart.app                            │
│ - Vercel Preview Deployment                         │
│ - Supabase Staging Project                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ Production (正式)                                    │
│ - quicksmart.app                                    │
│ - Vercel Production                                 │
│ - Supabase Production                               │
└─────────────────────────────────────────────────────┘
```

### 技術棧

| 服務 | Development | Staging | Production |
|-----|------------|---------|------------|
| **前端/後端** | Next.js Dev Server | Vercel Preview | Vercel Production |
| **資料庫** | Docker PostgreSQL | Supabase Staging | Supabase Production |
| **快取/Rate Limit** | 本地記憶體 | Upstash Redis | Upstash Redis |
| **AI 服務** | Claude API (Test Key) | Claude API (Test Key) | Claude API (Production Key) |
| **檔案儲存** | 本地檔案系統 | Vercel Blob | Vercel Blob |
| **錯誤追蹤** | Console | Sentry | Sentry |
| **日誌** | Console | Vercel Logs | Vercel Logs + Sentry |

---

## 🔧 部署前準備

### 1. 確認 PR 合併到 main

**檢查清單：**
- [ ] 所有測試通過（Unit + Integration + E2E）
- [ ] Code Review 完成（至少 1 位 Reviewer）
- [ ] 測試覆蓋率達標（≥ 85%）
- [ ] 無 Breaking Changes（或已標註 BREAKING CHANGE）
- [ ] 更新 CHANGELOG.md

**範例 CHANGELOG 更新：**
```markdown
# Changelog

## [Unreleased]

### Added
- Telegram bot integration (#123)
- Subscription reminder notification (#125)

### Fixed
- Sync conflict handling (#124)
- AI parsing accuracy improvement (#126)

### Changed
- Migrate to NextAuth.js v5 (#127)

## [0.2.0] - 2025-10-15

### Added
- Monthly AI insights report
- Export data functionality

...
```

### 2. 環境變數配置

**在 Vercel Dashboard 設定：**

**Staging 環境：**
```bash
# 資料庫
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/quicksmart_staging

# NextAuth.js
NEXTAUTH_URL=https://staging.quicksmart.app
NEXTAUTH_SECRET=[generate-new-secret]

# Claude AI
CLAUDE_API_KEY=sk-ant-[test-key]

# Upstash Redis
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=[token]

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENV=staging

# Encryption
ENCRYPTION_KEY=[32-byte-hex-staging]
```

**Production 環境（額外配置）：**
```bash
# 使用獨立的 Production Keys
CLAUDE_API_KEY=sk-ant-[production-key]
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/quicksmart_production
NEXTAUTH_URL=https://quicksmart.app
ENCRYPTION_KEY=[32-byte-hex-production]
SENTRY_ENV=production
```

### 3. 資料庫備份（生產環境）

**部署前自動備份：**
```bash
# .github/workflows/backup-before-deploy.yml
name: Backup Database Before Deploy
on:
  push:
    branches: [main]

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Production Database
        run: |
          TIMESTAMP=$(date +%Y%m%d-%H%M%S)
          pg_dump $DATABASE_URL > backup-$TIMESTAMP.sql
          gzip backup-$TIMESTAMP.sql

          # Upload to S3
          aws s3 cp backup-$TIMESTAMP.sql.gz \
            s3://quicksmart-backups/pre-deploy/
```

---

## 🧪 Staging 環境部署

### 自動部署流程

**Vercel Preview Deployment（每個 PR 自動建立）：**

```yaml
# .github/workflows/preview-deployment.yml
name: Preview Deployment
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm test

      - name: Deploy to Vercel
        run: |
          npx vercel deploy \
            --token=${{ secrets.VERCEL_TOKEN }} \
            --scope=quicksmart \
            > deployment-url.txt

      - name: Comment PR with Preview URL
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const url = fs.readFileSync('deployment-url.txt', 'utf8').trim();
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview Deployment: ${url}`
            });
```

### 手動部署到 Staging

```bash
# 1. 確認在 main 分支
git checkout main
git pull origin main

# 2. 部署到 Staging
npx vercel deploy --scope=quicksmart --target=staging

# 3. 取得 Staging URL
# 輸出: https://quicksmart-staging-xxx.vercel.app
```

### Staging 驗證清單

**功能測試：**
- [ ] 用戶註冊/登入正常
- [ ] 記帳功能正常（AI 解析）
- [ ] 訂閱管理功能正常
- [ ] 資料同步正常（多設備）

**效能測試：**
- [ ] 首屏載入 < 2s
- [ ] API 回應時間 < 1s
- [ ] Lighthouse 分數 ≥ 90

**安全測試：**
- [ ] HTTPS 強制啟用
- [ ] API Rate Limiting 正常
- [ ] 權限檢查正確（無法存取他人資料）

**整合測試：**
- [ ] Claude API 連線正常
- [ ] Supabase 連線正常
- [ ] Upstash Redis 連線正常

---

## 🚀 Production 環境部署

### 部署策略：藍綠部署（Vercel 自動支援）

**原理：**
```
舊版本（綠）: quicksmart.app --> Vercel Deployment v1.0
                              ↓
                          (流量切換)
                              ↓
新版本（藍）: quicksmart.app --> Vercel Deployment v1.1
```

### 自動部署流程

```yaml
# .github/workflows/production-deployment.yml
name: Production Deployment
on:
  push:
    branches: [main]

jobs:
  deploy-production:
    runs-on: ubuntu-latest

    # 只在所有測試通過後部署
    needs: [test]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      # 1. 安裝依賴
      - name: Install Dependencies
        run: npm ci

      # 2. 建置專案
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}
          CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY_PRODUCTION }}

      # 3. 執行資料庫遷移
      - name: Run Database Migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PRODUCTION }}

      # 4. 部署到 Vercel Production
      - name: Deploy to Vercel
        run: |
          npx vercel deploy \
            --prod \
            --token=${{ secrets.VERCEL_TOKEN }} \
            --scope=quicksmart \
            > deployment-url.txt

      # 5. 煙霧測試（Smoke Test）
      - name: Run Smoke Tests
        run: |
          DEPLOYMENT_URL=$(cat deployment-url.txt)
          npm run test:smoke -- --url=$DEPLOYMENT_URL

      # 6. 通知團隊
      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "✅ Production Deployment Successful",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "🚀 *Production Deployment Successful*\n\n*Deployment URL:* $(cat deployment-url.txt)\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      # 7. 錯誤通知
      - name: Notify on Failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "❌ Production Deployment Failed - Immediate Action Required!"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 手動部署（緊急情況）

```bash
# 1. 確認在 main 分支
git checkout main
git pull origin main

# 2. 執行資料庫遷移（如有）
npx prisma migrate deploy

# 3. 部署到 Production
npx vercel deploy --prod --scope=quicksmart

# 4. 執行煙霧測試
npm run test:smoke -- --url=https://quicksmart.app

# 5. 監控錯誤率（Sentry）
open https://sentry.io/organizations/quicksmart/issues/
```

### 部署後驗證

**自動化煙霧測試：**
```typescript
// __tests__/smoke/production.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests', () => {
  const BASE_URL = process.env.TEST_URL || 'https://quicksmart.app';

  test('首頁可以正常載入', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/QuickSmart/);
  });

  test('API 健康檢查通過', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
  });

  test('Claude API 連線正常', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/expenses`, {
      data: { text: '測試 100' },
      headers: { Authorization: `Bearer ${process.env.TEST_TOKEN}` }
    });

    expect(response.status()).toBe(201);
  });
});
```

**手動驗證清單：**
- [ ] 首頁載入正常
- [ ] 登入功能正常
- [ ] 記帳功能正常
- [ ] Sentry 無大量錯誤
- [ ] API 回應時間正常（< 1s）
- [ ] 資料庫連線正常

---

## 🗄️ 資料庫遷移

### Prisma Migrate 流程

**開發階段（本地）：**
```bash
# 1. 修改 Prisma Schema
# prisma/schema.prisma
model Expense {
  // 新增欄位
  aiConfidence Int?  // NEW
}

# 2. 建立遷移檔案
npx prisma migrate dev --name add_ai_confidence

# 3. 生成的遷移檔案
# prisma/migrations/20250120_add_ai_confidence/migration.sql
ALTER TABLE "Expense" ADD COLUMN "aiConfidence" INTEGER;

# 4. Prisma Client 自動更新
```

**部署到 Staging/Production：**
```bash
# 自動執行於 CI/CD Pipeline
npx prisma migrate deploy
```

### 危險遷移處理

**破壞性變更（需停機維護）：**
```sql
-- ❌ 直接刪除欄位（會遺失資料）
ALTER TABLE "Expense" DROP COLUMN "old_field";

-- ✅ 分階段遷移（零停機）
-- Phase 1: 新增新欄位
ALTER TABLE "Expense" ADD COLUMN "new_field" VARCHAR(255);

-- Phase 2: 資料遷移（背景執行）
UPDATE "Expense" SET "new_field" = "old_field";

-- Phase 3: 更新應用程式（使用 new_field）
-- 部署新版本...

-- Phase 4: 刪除舊欄位（下次部署）
ALTER TABLE "Expense" DROP COLUMN "old_field";
```

### 回滾資料庫遷移

**Prisma 不支援自動回滾，需手動處理：**

```bash
# 1. 查看遷移歷史
npx prisma migrate status

# 2. 回滾到特定版本（手動執行反向 SQL）
psql $DATABASE_URL -f prisma/migrations/rollback.sql

# rollback.sql 範例
ALTER TABLE "Expense" DROP COLUMN "aiConfidence";
```

---

## 📊 監控與告警

### Vercel Analytics

**自動啟用：**
- ✅ 頁面載入時間
- ✅ Core Web Vitals（LCP, FID, CLS）
- ✅ API 回應時間
- ✅ 錯誤率

**查看方式：**
```
Vercel Dashboard → quicksmart → Analytics
```

### Sentry 錯誤追蹤

**整合配置：**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENV,

  // 採樣率
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 只追蹤嚴重錯誤
  beforeSend(event, hint) {
    // 過濾掉不重要的錯誤
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      return null;  // 不回報
    }
    return event;
  },
});
```

**告警設定（Sentry）：**
```yaml
# 錯誤率 > 1%
Alert: Error Rate Spike
Condition: error_rate > 1%
Threshold: 10 errors in 5 minutes
Notification: Slack #alerts

# API 回應時間 > 3s
Alert: Slow API Response
Condition: p95_response_time > 3s
Threshold: 5 minutes
Notification: Slack #alerts
```

### 自訂健康檢查端點

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. 檢查資料庫連線
    await prisma.$queryRaw`SELECT 1`;

    // 2. 檢查 Claude API
    const claudeHealth = await checkClaudeAPI();

    // 3. 檢查 Redis
    const redisHealth = await checkRedis();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        claudeAPI: claudeHealth,
        redis: redisHealth,
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
      },
      { status: 503 }
    );
  }
}

// 使用 Uptime Robot 定期檢查
// https://uptimerobot.com/
// Monitor: https://quicksmart.app/api/health
// Interval: 5 minutes
```

### 日誌查詢

**Vercel Logs：**
```bash
# CLI 查詢
npx vercel logs quicksmart --since 1h

# 或在 Dashboard 查看
Vercel Dashboard → quicksmart → Logs
```

**Sentry Breadcrumbs（錯誤前的操作記錄）：**
```typescript
import * as Sentry from '@sentry/nextjs';

// 記錄用戶操作
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'User created expense',
  level: 'info',
  data: { amount: 65, category: 'FOOD' }
});

// 錯誤發生時，會顯示之前的操作記錄
```

---

## ⏪ 回滾流程

### 情境 1：部署後發現嚴重 Bug

**立即回滾（< 5 分鐘）：**

```bash
# 方法 1: Vercel Dashboard 一鍵回滾
# 1. 前往 Vercel Dashboard → Deployments
# 2. 找到上一個穩定版本
# 3. 點擊 "..." → "Promote to Production"

# 方法 2: CLI 回滾
npx vercel rollback
```

### 情境 2：資料庫遷移失敗

**回滾步驟：**
```bash
# 1. 停止新版本流量（Vercel 自動切回舊版）
npx vercel rollback

# 2. 回滾資料庫（執行反向 SQL）
psql $DATABASE_URL -f prisma/migrations/rollback.sql

# 3. 驗證資料完整性
npm run db:verify

# 4. 通知團隊
echo "❌ Deployment rolled back due to migration failure" | slack-notify
```

### 情境 3：效能嚴重降低

**逐步排查與回滾：**
```bash
# 1. 檢查 Sentry Performance
# https://sentry.io/performance/

# 2. 檢查資料庫慢查詢
# Supabase Dashboard → Logs → Slow Queries

# 3. 若無法快速修復，回滾
npx vercel rollback

# 4. 建立 Hotfix 分支修復
git checkout -b hotfix/performance-issue
```

---

## 🔍 故障排除

### 常見問題

#### 1. 部署失敗：Build Error

**錯誤訊息：**
```
Error: Build failed with exit code 1
Module not found: Can't resolve '@/domain/entities/Expense'
```

**解決方式：**
```bash
# 1. 檢查 TypeScript 編譯
npm run build

# 2. 檢查 tsconfig.json 的 paths 設定
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# 3. 清除快取重新安裝
rm -rf node_modules .next
npm install
npm run build
```

#### 2. 資料庫連線失敗

**錯誤訊息：**
```
Error: Can't reach database server at `db.xxx.supabase.co`
```

**解決方式：**
```bash
# 1. 檢查 DATABASE_URL 是否正確
echo $DATABASE_URL

# 2. 測試連線
psql $DATABASE_URL -c "SELECT 1"

# 3. 檢查 Supabase IP 白名單（若有）
# Supabase Dashboard → Settings → Database → Connection Pooling

# 4. 使用 Connection Pooling URL（推薦）
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true"
```

#### 3. Claude API Rate Limit

**錯誤訊息：**
```
Error: 429 Too Many Requests
```

**解決方式：**
```typescript
// 1. 檢查 API 配額
// https://console.anthropic.com/settings/limits

// 2. 實作指數退避（Exponential Backoff）
async function callClaudeWithRetry(input: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await claudeAPI.parse(input);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}

// 3. 啟用 Fallback Parser
```

#### 4. Vercel 函數超時

**錯誤訊息：**
```
Error: Function execution timed out after 10s
```

**解決方式：**
```typescript
// vercel.json
{
  "functions": {
    "app/api/expenses/route.ts": {
      "maxDuration": 30  // 增加到 30 秒（Pro Plan）
    }
  }
}

// 或優化查詢效能
// 1. 新增資料庫索引
// 2. 使用分頁（limit + offset）
// 3. 快取熱門查詢
```

### 緊急聯絡人

**技術問題：**
- On-Call Engineer: @tech-lead（Slack）
- 緊急電話: +886-XXX-XXXXXX

**基礎設施問題：**
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/dashboard/support

---

## 📋 部署檢查清單（完整版）

### 部署前（Pre-Deployment）

- [ ] 所有測試通過（Unit + Integration + E2E）
- [ ] 測試覆蓋率 ≥ 85%
- [ ] Code Review 完成
- [ ] Staging 環境驗證完成
- [ ] 更新 CHANGELOG.md
- [ ] 資料庫遷移腳本準備（如有）
- [ ] 備份生產資料庫

### 部署中（Deployment）

- [ ] 資料庫遷移執行成功
- [ ] Vercel 部署成功
- [ ] 煙霧測試通過
- [ ] 健康檢查通過（/api/health）

### 部署後（Post-Deployment）

- [ ] 監控錯誤率（Sentry）< 1%
- [ ] API 回應時間 P95 < 1s
- [ ] Core Web Vitals 正常（LCP < 2.5s）
- [ ] 用戶回報無異常
- [ ] 通知團隊部署完成

---

**文件版本：v1.0**
**最後更新：2025-10-20**
**維護者：DevOps 團隊**
