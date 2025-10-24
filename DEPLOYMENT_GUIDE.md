# QuickSmart 智能記帳 - 部署指南

完整的自動化部署流程和配置說明。

## 📋 目錄

- [部署架構](#部署架構)
- [環境配置](#環境配置)
- [GitHub Actions 設置](#github-actions-設置)
- [Vercel 部署](#vercel-部署)
- [Supabase 配置](#supabase-配置)
- [部署流程](#部署流程)
- [監控和回滾](#監控和回滾)

---

## 🏗️ 部署架構

### 技術棧
- **前端/API**: Vercel (Next.js)
- **數據庫**: Supabase (PostgreSQL)
- **Edge Functions**: Supabase Functions
- **CI/CD**: GitHub Actions
- **版本控制**: GitHub

### 環境策略

| 環境 | 分支 | URL | 用途 |
|-----|------|-----|------|
| **Production** | `main` | `quicksmart.vercel.app` | 正式環境 |
| **Staging** | `develop` | `quicksmart-staging.vercel.app` | 測試環境 |
| **Development** | 本地 | `localhost:3000` | 開發環境 |

---

## 🔐 環境配置

### 1. GitHub Secrets 設置

前往 GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

#### 必需的 Secrets:

**Vercel 相關**:
```
VERCEL_TOKEN              # Vercel API Token
VERCEL_ORG_ID            # Vercel Organization ID
VERCEL_PROJECT_ID        # Vercel Project ID
```

**Supabase 相關**:
```
SUPABASE_PROJECT_REF     # Supabase Project Reference (dckthwceyfngzpmyuybp)
SUPABASE_ACCESS_TOKEN    # Supabase Access Token
NEXT_PUBLIC_SUPABASE_URL # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase Anon Key
```

**AI 服務**:
```
OPENAI_API_KEY           # OpenAI API Key
```

**安全掃描 (選用)**:
```
SNYK_TOKEN              # Snyk Security Scanning Token
```

### 2. 獲取 Vercel Tokens

#### 步驟 1: 獲取 VERCEL_TOKEN
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 獲取 token
vercel token create
```

#### 步驟 2: 獲取組織和專案 ID
```bash
# 連結專案
cd "C:\Users\User\Desktop\新增資料夾\智能記帳"
vercel link

# 查看 .vercel/project.json
cat .vercel/project.json
```

輸出示例:
```json
{
  "orgId": "team_xxx...",
  "projectId": "prj_xxx..."
}
```

### 3. 獲取 Supabase Tokens

#### 步驟 1: Project Reference
```
已知: dckthwceyfngzpmyuybp
```

#### 步驟 2: Access Token
1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. Account Settings → Access Tokens
3. Generate new token
4. 複製並保存到 GitHub Secrets

### 4. Vercel 環境變量設置

前往 [Vercel Dashboard](https://vercel.com/dashboard) → 您的專案 → Settings → Environment Variables

添加以下變量:

| 變量名 | 值 | 環境 |
|-------|---|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dckthwceyfngzpmyuybp.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | All |
| `OPENAI_API_KEY` | `sk-...` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://quicksmart.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://quicksmart-staging.vercel.app` | Preview |

---

## ⚙️ GitHub Actions 設置

### 已創建的 Workflows

#### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

**觸發條件**:
- Push to `main` 或 `develop`
- Pull Request to `main` 或 `develop`

**包含的 Jobs**:
```
1. Lint & Type Check     ─┐
2. Unit Tests            ─┤
3. Build Application     ─┼─→ 4. Deploy to Production (main only)
4. Database Check        ─┤                ↓
5. Security Scan         ─┘         5. Health Check
```

**功能**:
- ✅ 代碼質量檢查 (ESLint + TypeScript)
- ✅ 單元測試執行
- ✅ 構建驗證
- ✅ 數據庫遷移檢查
- ✅ 安全漏洞掃描
- ✅ 自動部署到 Vercel
- ✅ 部署後健康檢查

#### 2. Edge Functions Deployment (`.github/workflows/deploy-edge-functions.yml`)

**觸發條件**:
- Push to `main` 且修改了 `supabase/functions/**`
- 手動觸發 (workflow_dispatch)

**部署的函數**:
- `subscription-billing-check`
- `anomaly-detection`
- `analytics-cache-refresh`

#### 3. Database Migration (`.github/workflows/database-migration.yml`)

**觸發條件**:
- 手動觸發，需要確認

**安全措施**:
- 需要輸入 "CONFIRM" 才能執行
- 自動創建備份
- 環境選擇 (production/staging)

---

## 🚀 Vercel 部署

### 初始設置

#### 1. 連結 GitHub Repository

```bash
# 1. 前往 Vercel Dashboard
# 2. New Project
# 3. Import Git Repository
# 4. 選擇您的 GitHub repository
```

#### 2. 配置構建設置

**Framework Preset**: Next.js
**Root Directory**: `./`
**Build Command**: `npm run build`
**Output Directory**: `.next`
**Install Command**: `npm install`

#### 3. 配置環境變量

在 Vercel Dashboard 中添加所有環境變量（見上方表格）

### 部署策略

#### Production (main 分支)
```
Push to main → GitHub Actions CI → Vercel Deploy → Health Check
```

特點:
- ✅ 自動部署
- ✅ 完整的 CI 流程
- ✅ 部署後驗證
- ✅ 自動回滾（如果健康檢查失敗）

#### Staging (develop 分支)
```
Push to develop → GitHub Actions CI → Vercel Deploy (Preview)
```

特點:
- ✅ 自動部署到預覽環境
- ✅ 獨立的數據庫實例（可選）
- ✅ 完整功能測試

#### Pull Request 預覽
```
Create PR → GitHub Actions CI → Vercel Deploy (PR Preview)
```

特點:
- ✅ 每個 PR 獨立預覽環境
- ✅ 自動生成預覽 URL
- ✅ 代碼審查友好

---

## 🗄️ Supabase 配置

### 數據庫遷移

#### 方法 1: 通過 GitHub Actions (推薦)

```bash
# 1. 前往 GitHub Repository
# 2. Actions → Database Migration
# 3. Run workflow
# 4. 選擇環境 (production/staging)
# 5. 輸入 "CONFIRM"
# 6. Run
```

#### 方法 2: 本地執行

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入
supabase login

# 連結專案
supabase link --project-ref dckthwceyfngzpmyuybp

# 執行遷移
supabase db push
```

### Edge Functions 部署

#### 自動部署（推薦）
當您修改 `supabase/functions/**` 並 push 到 `main` 時，GitHub Actions 會自動部署。

#### 手動部署
```bash
# 部署單一函數
supabase functions deploy subscription-billing-check

# 部署所有函數
supabase functions deploy subscription-billing-check
supabase functions deploy anomaly-detection
supabase functions deploy analytics-cache-refresh
```

### 設置 Cron Jobs

在 Supabase Dashboard → SQL Editor 執行:

```sql
-- 每天凌晨 1 點執行訂閱檢查
SELECT cron.schedule(
  'subscription-billing-check',
  '0 1 * * *',
  $$
  SELECT net.http_post(
    url:='https://dckthwceyfngzpmyuybp.supabase.co/functions/v1/subscription-billing-check',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);

-- 每天凌晨 2 點執行異常偵測
SELECT cron.schedule(
  'anomaly-detection',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://dckthwceyfngzpmyuybp.supabase.co/functions/v1/anomaly-detection',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);

-- 每天凌晨 3 點刷新分析緩存
SELECT cron.schedule(
  'analytics-cache-refresh',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url:='https://dckthwceyfngzpmyuybp.supabase.co/functions/v1/analytics-cache-refresh',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

---

## 📦 部署流程

### 完整部署流程 (Production)

#### 1. 準備階段
```bash
# 確保所有測試通過
npm run test

# 確保構建成功
npm run build

# 確保類型檢查通過
npm run type-check
```

#### 2. 提交代碼
```bash
git add .
git commit -m "feat: your feature description"
git push origin develop
```

#### 3. 創建 Pull Request
```bash
# 在 GitHub 上創建 PR: develop → main
# 等待 CI 檢查通過
# 請求代碼審查
```

#### 4. 合併到 Main
```bash
# 審查通過後合併
# GitHub Actions 自動觸發
```

#### 5. 自動部署流程
```
1. ✅ Lint & Type Check
2. ✅ Run Tests
3. ✅ Build Application
4. ✅ Security Scan
5. ✅ Deploy to Vercel
6. ✅ Health Check
7. ✅ Notify Success/Failure
```

#### 6. 驗證部署
```bash
# 檢查健康端點
curl https://quicksmart.vercel.app/api/health

# 預期響應:
{
  "status": "healthy",
  "timestamp": "2025-01-24T12:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "ai": "configured",
    "environment": "production"
  }
}
```

### 快速修復流程 (Hotfix)

```bash
# 1. 從 main 創建 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. 修復問題
# ... 編輯代碼 ...

# 3. 測試
npm run test
npm run build

# 4. 提交
git add .
git commit -m "fix: critical bug description"
git push origin hotfix/critical-bug-fix

# 5. 創建 PR 到 main
# 6. 快速審查並合併
# 7. 自動部署
```

---

## 📊 監控和回滾

### 部署監控

#### 1. Vercel Dashboard
- 訪問: https://vercel.com/dashboard
- 查看部署狀態
- 查看日誌
- 查看性能指標

#### 2. Supabase Dashboard
- 訪問: https://supabase.com/dashboard
- 監控數據庫性能
- 查看 Edge Functions 日誌
- 查看 API 使用量

#### 3. GitHub Actions
- 訪問: Repository → Actions
- 查看 workflow 執行狀態
- 下載日誌
- 查看測試報告

### 健康檢查

#### 自動健康檢查
部署後自動執行：
```bash
GET https://quicksmart.vercel.app/api/health
```

#### 手動健康檢查
```bash
# 檢查 API 健康
curl https://quicksmart.vercel.app/api/health

# 檢查數據庫連接
curl https://quicksmart.vercel.app/api/expenses?page=1&limit=1

# 檢查 AI 服務
curl -X POST https://quicksmart.vercel.app/api/expenses/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": "午餐 150"}'
```

### 回滾策略

#### 方法 1: Vercel Dashboard 回滾 (最快)
```
1. 前往 Vercel Dashboard
2. 選擇專案 → Deployments
3. 找到之前的穩定版本
4. 點擊 "..." → Promote to Production
5. 確認回滾
```

#### 方法 2: Git 回滾
```bash
# 1. 回滾到之前的 commit
git revert HEAD
git push origin main

# 2. 或者重新部署舊版本
git checkout <previous-stable-commit>
git push origin main --force
```

#### 方法 3: 數據庫回滾
```bash
# 如果需要回滾數據庫
# 1. 下載備份（從 GitHub Actions artifacts）
# 2. 在 Supabase Dashboard 執行回滾
```

### 告警設置

#### Vercel 告警
1. Vercel Dashboard → Settings → Alerts
2. 配置:
   - Deployment failure
   - Performance degradation
   - Error rate threshold

#### Supabase 告警
1. Supabase Dashboard → Settings → Alerts
2. 配置:
   - Database CPU usage
   - Connection pool usage
   - API rate limits

---

## 🔧 故障排除

### 常見問題

#### 1. 部署失敗: "Build Error"
```bash
# 檢查日誌
# Vercel Dashboard → Deployments → 失敗的部署 → Build Logs

# 常見原因:
- 環境變量缺失
- TypeScript 錯誤
- 依賴安裝失敗

# 解決方法:
npm run build  # 本地測試
```

#### 2. 健康檢查失敗
```bash
# 檢查:
1. Supabase 是否在線
2. 環境變量是否正確
3. 數據庫遷移是否完成

# 解決:
- 查看 Supabase Dashboard
- 重新部署
- 檢查 RLS policies
```

#### 3. Edge Functions 無法調用
```bash
# 檢查:
1. Functions 是否已部署
2. Cron jobs 是否已設置
3. 權限是否正確

# 解決:
supabase functions list
supabase functions deploy <function-name>
```

#### 4. 數據庫連接超時
```bash
# 檢查:
1. Connection pooling 設置
2. Supabase 計劃限制

# 解決:
- 升級 Supabase 計劃
- 優化查詢
- 添加索引
```

---

## ✅ 部署前檢查清單

### 代碼質量
- [ ] 所有測試通過 (`npm run test`)
- [ ] 類型檢查通過 (`npm run type-check`)
- [ ] Lint 檢查通過 (`npm run lint`)
- [ ] 本地構建成功 (`npm run build`)

### 環境配置
- [ ] GitHub Secrets 已配置
- [ ] Vercel 環境變量已設置
- [ ] Supabase 項目已連結
- [ ] Claude API Key 已配置

### 數據庫
- [ ] 遷移文件已測試
- [ ] RLS Policies 已啟用
- [ ] 索引已優化
- [ ] 備份策略已設置

### 監控
- [ ] 健康檢查端點可訪問
- [ ] Vercel 告警已配置
- [ ] Supabase 告警已配置
- [ ] 日誌系統正常

### 文檔
- [ ] API 文檔已更新
- [ ] README 已更新
- [ ] CHANGELOG 已更新
- [ ] 部署指南已審查

---

## 📞 支持和資源

### 文檔
- [Vercel 文檔](https://vercel.com/docs)
- [Supabase 文檔](https://supabase.com/docs)
- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [Next.js 文檔](https://nextjs.org/docs)

### 監控工具
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Actions: Repository → Actions

### 緊急聯繫
- 技術負責人: [您的聯繫方式]
- 運維團隊: [團隊聯繫方式]

---

**版本**: 1.0.0
**最後更新**: 2025-01-24
**狀態**: ✅ 部署流程已配置完成
