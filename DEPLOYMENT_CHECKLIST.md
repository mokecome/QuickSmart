# 部署檢查清單

每次部署前請完成此清單。

## 📋 部署前檢查 (Pre-Deployment)

### 代碼質量
```bash
# 1. 運行測試
□ npm run test
  └─ 所有測試通過

# 2. 類型檢查
□ npm run type-check
  └─ 無 TypeScript 錯誤

# 3. Lint 檢查
□ npm run lint
  └─ 無 ESLint 錯誤

# 4. 本地構建
□ npm run build
  └─ 構建成功
```

### 環境配置
```
□ GitHub Secrets 已配置
  ├─ VERCEL_TOKEN
  ├─ VERCEL_ORG_ID
  ├─ VERCEL_PROJECT_ID
  ├─ SUPABASE_PROJECT_REF
  ├─ SUPABASE_ACCESS_TOKEN
  ├─ NEXT_PUBLIC_SUPABASE_URL
  ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
  └─ OPENAI_API_KEY

□ Vercel 環境變量已配置
  ├─ Production 環境
  ├─ Preview 環境
  └─ Development 環境

□ .env.local 已更新
  └─ 所有必需變量已設置
```

### 數據庫
```
□ 數據庫遷移文件已創建
  └─ supabase/migrations/*.sql

□ 遷移文件已在本地測試
  └─ supabase db push (本地)

□ RLS Policies 已驗證
  ├─ user_profiles
  ├─ expenses
  ├─ subscriptions
  ├─ ai_learning_samples
  ├─ notifications
  └─ analytics_cache

□ 數據庫備份已確認
  └─ 最近備份時間: __________
```

### Git 和分支
```
□ 代碼已提交到正確分支
  └─ 分支名稱: __________

□ Pull Request 已創建
  └─ PR #: __________

□ 代碼審查已完成
  └─ 審查者: __________

□ 所有 CI 檢查已通過
  ├─ Lint & Type Check
  ├─ Unit Tests
  ├─ Build
  └─ Security Scan
```

---

## 🚀 部署執行 (Deployment)

### Production 部署
```
□ 合併 PR 到 main 分支
  └─ Merge commit: __________

□ GitHub Actions 自動觸發
  └─ Workflow run #: __________

□ Vercel 開始部署
  └─ Deployment URL: __________

□ 等待部署完成 (約 2-5 分鐘)
  └─ 狀態: Ready / Building / Error
```

### Edge Functions 部署
```
□ 檢查是否修改了 Edge Functions
  └─ supabase/functions/ 目錄

□ GitHub Actions 自動部署
  └─ 或手動觸發 workflow

□ 驗證 Functions 已部署
  └─ supabase functions list
```

---

## ✅ 部署後驗證 (Post-Deployment)

### 健康檢查
```bash
# 1. API 健康檢查
□ curl https://quicksmart.vercel.app/api/health
  └─ 響應: {"status":"healthy"}

# 2. 數據庫連接
□ 測試任一 API 端點
  └─ 例如: GET /api/expenses

# 3. 認證流程
□ 測試登入/登出
  └─ OAuth 回調正常
```

### 功能測試
```
□ 快速記帳功能
  ├─ AI 解析正常
  └─ 記錄保存成功

□ 訂閱管理功能
  ├─ 創建訂閱
  └─ 查看訂閱列表

□ 智能分析功能
  ├─ 月度分析
  └─ 趨勢分析

□ 通知功能
  └─ 通知列表顯示
```

### 性能檢查
```
□ 頁面載入速度
  └─ < 3 秒

□ API 響應時間
  └─ < 500ms (平均)

□ Lighthouse 評分
  ├─ Performance: > 90
  ├─ Accessibility: > 90
  ├─ Best Practices: > 90
  └─ SEO: > 90
```

### 監控設置
```
□ Vercel Analytics 運行中
  └─ Dashboard 顯示數據

□ Supabase Monitoring 運行中
  └─ Database metrics 正常

□ Error tracking 正常
  └─ 無新錯誤報告

□ 告警已配置
  ├─ Deployment failures
  └─ Error rate threshold
```

---

## 🔄 Edge Functions 檢查

### Cron Jobs 狀態
```sql
-- 在 Supabase SQL Editor 執行
SELECT * FROM cron.job;

□ subscription-billing-check
  └─ 排程: 0 1 * * * (每天凌晨 1 點)

□ anomaly-detection
  └─ 排程: 0 2 * * * (每天凌晨 2 點)

□ analytics-cache-refresh
  └─ 排程: 0 3 * * * (每天凌晨 3 點)
```

### Function 測試
```bash
# 手動觸發測試
□ subscription-billing-check
  └─ curl -X POST <function-url>

□ anomaly-detection
  └─ curl -X POST <function-url>

□ analytics-cache-refresh
  └─ curl -X POST <function-url>
```

---

## 📊 數據遷移檢查 (如適用)

### 遷移執行
```
□ 數據庫備份已創建
  └─ 備份文件: __________

□ 遷移腳本已執行
  └─ supabase db push

□ 遷移結果已驗證
  └─ 表結構正確

□ 數據完整性檢查
  └─ 記錄數量正確
```

### 回滾準備
```
□ 回滾腳本已準備
  └─ 位置: __________

□ 備份可恢復
  └─ 已測試恢復流程

□ 回滾聯繫人已確認
  └─ 負責人: __________
```

---

## 🔔 通知和文檔

### 團隊通知
```
□ 部署通知已發送
  ├─ 開發團隊
  ├─ 產品團隊
  └─ 運維團隊

□ Release Notes 已發布
  └─ 版本: __________

□ CHANGELOG 已更新
  └─ 新功能和修復已記錄
```

### 文檔更新
```
□ API 文檔已更新
  └─ API_DOCUMENTATION.md

□ README 已更新
  └─ README.md

□ 部署指南已審查
  └─ DEPLOYMENT_GUIDE.md
```

---

## 🚨 緊急回滾程序

### 何時需要回滾
```
□ 健康檢查失敗
□ 關鍵功能無法使用
□ 數據庫錯誤
□ 性能嚴重下降
□ 安全漏洞發現
```

### 回滾步驟
```
1. □ 通知團隊決定回滾
2. □ 在 Vercel Dashboard 選擇穩定版本
3. □ 點擊 "Promote to Production"
4. □ 等待回滾完成 (約 1-2 分鐘)
5. □ 驗證回滾後系統正常
6. □ 通知團隊回滾完成
7. □ 分析問題原因
8. □ 創建 Hotfix 分支修復
```

---

## 📞 緊急聯繫信息

### 技術團隊
```
技術負責人: __________
電話: __________
Email: __________

運維負責人: __________
電話: __________
Email: __________
```

### 第三方服務支持
```
Vercel Support: https://vercel.com/support
Supabase Support: https://supabase.com/support
OpenAI Support: https://help.openai.com
```

---

## 📝 部署記錄

### 本次部署信息
```
部署日期: __________
部署時間: __________
部署者: __________
版本號: __________
Git Commit: __________
部署環境: □ Production □ Staging
```

### 部署結果
```
□ 成功 - 無問題
□ 成功 - 有小問題 (已記錄)
□ 失敗 - 已回滾
□ 失敗 - 需要緊急修復
```

### 問題記錄
```
發現的問題:
1. __________
2. __________
3. __________

解決方案:
1. __________
2. __________
3. __________
```

---

## ✅ 簽核

### 技術審查
```
代碼審查: __________ (簽名)  日期: __________
測試驗證: __________ (簽名)  日期: __________
安全審查: __________ (簽名)  日期: __________
```

### 部署批准
```
技術負責人: __________ (簽名)  日期: __________
產品負責人: __________ (簽名)  日期: __________
```

---

**檢查清單版本**: 1.0.0
**最後更新**: 2025-01-24
**適用環境**: Production, Staging
