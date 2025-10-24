# QuickSmart 智能記帳 - 後端架構設計文檔

**版本**: v2.1 (OpenAI Edition)
**最後更新**: 2025-10-24
**技術棧**: Node.js + TypeScript + Supabase + OpenAI GPT
**架構模式**: Clean Architecture + DDD (Domain-Driven Design)

---

## 目錄

1. [架構概述](#1-架構概述)
2. [技術選型](#2-技術選型)
3. [系統架構](#3-系統架構)
4. [項目目錄結構](#4-項目目錄結構)
5. [數據庫設計](#5-數據庫設計)
6. [API 接口設計](#6-api-接口設計)
7. [核心業務邏輯](#7-核心業務邏輯)
8. [AI 整合方案](#8-ai-整合方案)
9. [安全與認證](#9-安全與認證)
10. [部署與運維](#10-部署與運維)

---

## 1. 架構概述

### 1.1 設計原則

- **單一職責原則**: 每個模塊只負責一個功能領域
- **依賴倒置**: 業務邏輯不依賴於框架和基礎設施
- **領域驅動設計**: 以業務領域為核心組織代碼
- **測試驅動開發**: 先寫測試，再寫實現 (基於 User Story AC)
- **SOLID 原則**: 保持代碼可維護性和可擴展性

### 1.2 架構層次

```
┌─────────────────────────────────────────┐
│      Presentation Layer (API)           │  HTTP/REST API
├─────────────────────────────────────────┤
│      Application Layer (Use Cases)      │  業務用例編排 (基於 User Story)
├─────────────────────────────────────────┤
│      Domain Layer (Business Logic)      │  核心業務邏輯 (事件驅動)
├─────────────────────────────────────────┤
│      Infrastructure Layer               │  Supabase/AI/外部服務
└─────────────────────────────────────────┘
```

### 1.3 核心特性

- ✅ RESTful API 設計
- ✅ Supabase Auth 身份認證 (Google OAuth + Email)
- ✅ AI 自然語言解析 (OpenAI GPT-4o-mini)
- ✅ 智能降級機制 (規則引擎備援)
- ⚠️ 多設備同步 (數據庫支持，API 未實現)
- ✅ 定時任務調度 (訂閱提醒 + 自動記帳)
- ⚠️ 實時通知推送 (基礎框架已建立)
- ✅ 數據緩存優化 (Supabase 緩存策略)
- ⚠️ 事件驅動架構 (簡化實現)

---

## 2. 技術選型

### 2.1 核心技術

| 技術 | 版本 | 用途 | 原因 |
|------|------|------|------|
| **Node.js** | 20.x LTS | 運行時環境 | 高性能、生態豐富 |
| **TypeScript** | 5.x | 開發語言 | 類型安全、開發體驗好 |
| **Next.js** | 14.x | 全棧框架 | SSR/API Routes/性能優化 |
| **Supabase** | Latest | BaaS 平台 | PostgreSQL + Auth + Storage + Realtime |
| **Supabase JS** | 2.x | Supabase 客戶端 | 類型安全、實時訂閱 |

### 2.2 Supabase 功能模塊

| 功能 | 用途 | 優勢 |
|------|------|------|
| **Supabase Database** | PostgreSQL 15 數據庫 | 自動備份、擴展性好 |
| **Supabase Auth** | 認證服務 | Google OAuth、Email 登入 |
| **Supabase Storage** | 文件存儲 | 用戶頭像、附件上傳 |
| **Supabase Realtime** | 實時訂閱 | 多設備數據同步 |
| **Supabase Edge Functions** | Serverless 函數 | 定時任務、Webhook |
| **Row Level Security (RLS)** | 行級安全 | 數據隔離、權限控制 |

### 2.3 AI & 外部服務

| 服務 | 用途 | 降級方案 |
|------|------|----------|
| **OpenAI GPT-4o-mini** | 自然語言解析 | 本地規則引擎 |
| **Resend** | 郵件發送 | Supabase Auth Email 備用 |
| **Telegram Bot API** | Telegram 整合 | 可選功能 |
| **Firebase Cloud Messaging** | 推播通知 | Email 備援 |

### 2.4 開發工具

| 工具 | 用途 |
|------|------|
| **Vitest** | 單元測試 |
| **Playwright** | E2E 測試 |
| **ESLint** | 代碼檢查 |
| **Prettier** | 代碼格式化 |
| **Husky** | Git Hooks |
| **Sentry** | 錯誤監控 |
| **Supabase CLI** | 本地開發、遷移管理 |

---

## 3. 系統架構

### 3.1 架構圖

```
┌─────────────┐
│   用戶端     │
│ (Web/Mobile)│
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│         Next.js API Routes          │
│  ┌──────────┬──────────┬──────────┐ │
│  │  Auth    │  Expense │  Sub.    │ │
│  │Middleware│  Routes  │ Routes   │ │
│  └──────────┴──────────┴──────────┘ │
└─────────────┬───────────────────────┘
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
┌───────────┐  ┌──────────┐
│  OpenAI   │  │ Supabase │
│    GPT    │  │  Cache   │
└───────────┘  └──────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        Application Services         │
│  ┌──────────────────────────────┐   │
│  │  ExpenseParserService        │   │
│  │  SubscriptionManagerService  │   │
│  │  NotificationService         │   │
│  │  AILearningService           │   │
│  └──────────────────────────────┘   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         Domain Models               │
│  ┌──────────────────────────────┐   │
│  │  Expense, Subscription,      │   │
│  │  User, AILearningSample      │   │
│  └──────────────────────────────┘   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         Supabase Client             │
│  ┌──────────────────────────────┐   │
│  │  Database, Auth, Storage,    │   │
│  │  Realtime, Edge Functions    │   │
│  └──────────────────────────────┘   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Supabase PostgreSQL            │
└─────────────────────────────────────┘
```

### 3.2 數據流向

#### 3.2.1 記帳流程 (基於 US-001)

```
用戶輸入 → API Gateway → Supabase Auth 驗證 → ExpenseParserService
                                                      ↓
                                                OpenAI GPT 解析
                                                      ↓
                                                ┌─────┴─────┐
                                                │  成功?    │
                                                └─────┬─────┘
                                           成功 ↙      ↘ 失敗
                                      保存到 Supabase   規則引擎降級
                                           ↓             ↓
                                      觸發事件       返回降級結果
                                  ExpenseCreated
```

#### 3.2.2 訂閱提醒流程 (基於 US-011, US-012)

```
Edge Function (Cron) → 查詢即將扣款的訂閱 → 判斷提醒時機
                                               ↓
                            ┌──────────────────┴──────────────┐
                            │                                 │
                        3天前/1天前/當天                    當天
                            ↓                                 ↓
                   發送通知 (Push+Email)                自動創建支出記錄
                   BillingReminderSent                  SubscriptionBilled
                                                              ↓
                                                        更新下次扣款日
                                                   BillingDateCalculated
```

#### 3.2.3 多設備同步流程 (基於 US-030)

```
設備 A 修改 → Supabase Realtime → 設備 B 收到通知
    ↓                                    ↓
版本檢查                            更新本地數據
    ↓
衝突偵測? → 是 → SyncConflictDetected → 用戶解決
    ↓ 否
成功更新
```

---

## 4. 項目目錄結構

```
quicksmart-backend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # 認證相關 (基於 US-005)
│   │   │   │   ├── callback/
│   │   │   │   │   └── route.ts      # OAuth 回調
│   │   │   │   ├── signout/
│   │   │   │   │   └── route.ts      # POST /api/auth/signout
│   │   │   │   └── session/
│   │   │   │       └── route.ts      # GET /api/auth/session
│   │   │   │
│   │   │   ├── expenses/             # 支出管理 (基於 US-001, US-004)
│   │   │   │   ├── parse/
│   │   │   │   │   └── route.ts      # POST /api/expenses/parse (US-001)
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts      # GET/PUT/DELETE /api/expenses/:id
│   │   │   │   ├── correct/
│   │   │   │   │   └── route.ts      # POST /api/expenses/correct (US-003)
│   │   │   │   └── route.ts          # GET/POST /api/expenses
│   │   │   │
│   │   │   ├── subscriptions/        # 訂閱管理 (基於 US-010~013)
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts      # GET/PUT/DELETE /api/subscriptions/:id
│   │   │   │   │   ├── cancel/
│   │   │   │   │   │   └── route.ts  # POST /api/subscriptions/:id/cancel (US-013)
│   │   │   │   │   └── pause/
│   │   │   │   │       └── route.ts  # POST /api/subscriptions/:id/pause (US-013)
│   │   │   │   ├── summary/
│   │   │   │   │   └── route.ts      # GET /api/subscriptions/summary
│   │   │   │   └── route.ts          # GET/POST /api/subscriptions (US-010)
│   │   │   │
│   │   │   ├── insights/             # 智能分析 (基於 US-020, US-021)
│   │   │   │   ├── monthly/
│   │   │   │   │   └── route.ts      # GET /api/insights/monthly (US-020)
│   │   │   │   ├── trends/
│   │   │   │   │   └── route.ts      # GET /api/insights/trends
│   │   │   │   └── anomalies/
│   │   │   │       └── route.ts      # GET /api/insights/anomalies (US-021)
│   │   │   │
│   │   │   ├── notifications/        # 通知管理 (基於 US-015)
│   │   │   │   ├── [id]/read/
│   │   │   │   │   └── route.ts      # PUT /api/notifications/:id/read
│   │   │   │   └── route.ts          # GET /api/notifications
│   │   │   │
│   │   │   ├── telegram/             # Telegram Bot (基於 US-007)
│   │   │   │   ├── webhook/
│   │   │   │   │   └── route.ts      # POST /api/telegram/webhook
│   │   │   │   └── link/
│   │   │   │       └── route.ts      # POST /api/telegram/link
│   │   │   │
│   │   │   ├── sync/                 # 多設備同步 (基於 US-030)
│   │   │   │   └── route.ts          # POST /api/sync
│   │   │   │
│   │   │   └── onboarding/           # 用戶引導 (基於 US-006)
│   │   │       └── complete/
│   │   │           └── route.ts      # POST /api/onboarding/complete
│   │   │
│   │   └── layout.tsx                # Root Layout
│   │
│   ├── application/                  # 應用層 (Use Cases - 對應 User Story)
│   │   ├── use-cases/
│   │   │   ├── expenses/
│   │   │   │   ├── parseExpense.ts           # US-001: AI 解析記帳
│   │   │   │   ├── parseWithFallback.ts      # US-002: AI 降級機制
│   │   │   │   ├── correctCategory.ts        # US-003: 分類修正與學習
│   │   │   │   ├── createExpense.ts          # US-004: 創建支出
│   │   │   │   ├── updateExpense.ts          # US-004: 更新支出
│   │   │   │   ├── deleteExpense.ts          # US-004: 刪除支出
│   │   │   │   ├── getExpenses.ts            # US-004: 查詢支出列表
│   │   │   │   └── getExpenseById.ts         # US-004: 查詢單個支出
│   │   │   │
│   │   │   ├── subscriptions/
│   │   │   │   ├── createSubscription.ts     # US-010: 創建訂閱
│   │   │   │   ├── updateSubscription.ts     # US-013: 更新訂閱
│   │   │   │   ├── cancelSubscription.ts     # US-013: 取消訂閱
│   │   │   │   ├── pauseSubscription.ts      # US-013: 暫停訂閱
│   │   │   │   ├── getSubscriptions.ts       # 查詢訂閱列表
│   │   │   │   ├── calculateNextBilling.ts   # US-010: 計算下次扣款
│   │   │   │   ├── checkBillingReminders.ts  # US-011: 檢查扣款提醒
│   │   │   │   ├── processSubscriptionBilling.ts # US-012: 訂閱自動記帳
│   │   │   │   └── getSubscriptionSummary.ts # 訂閱總覽
│   │   │   │
│   │   │   ├── insights/
│   │   │   │   ├── generateMonthlyInsights.ts # US-020: 月度洞察
│   │   │   │   ├── detectAnomalies.ts         # US-021: 異常檢測
│   │   │   │   ├── identifyTrends.ts          # US-021: 趨勢識別
│   │   │   │   └── aggregateMonthlyData.ts    # US-020: 月度彙總
│   │   │   │
│   │   │   ├── sync/
│   │   │   │   ├── syncChanges.ts             # US-030: 多設備同步
│   │   │   │   ├── detectConflicts.ts         # US-030: 衝突偵測
│   │   │   │   └── resolveConflict.ts         # US-030: 衝突解決
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── registerUser.ts            # US-005: 用戶註冊
│   │   │   │   ├── loginUser.ts               # US-005: 用戶登入
│   │   │   │   └── validateSession.ts         # 驗證會話
│   │   │   │
│   │   │   ├── onboarding/
│   │   │   │   ├── completeOnboarding.ts      # US-006: 完成引導
│   │   │   │   └── trackAhaMoment.ts          # US-006: 追蹤 Aha Moment
│   │   │   │
│   │   │   └── telegram/
│   │   │       ├── linkTelegram.ts            # US-007: 綁定 Telegram
│   │   │       └── handleTelegramMessage.ts   # US-007: 處理 Bot 訊息
│   │   │
│   │   └── services/
│   │       ├── AIParserService.ts            # AI 解析服務
│   │       ├── RuleBasedParserService.ts     # 規則引擎 (降級)
│   │       ├── NotificationService.ts        # US-015: 通知服務
│   │       ├── AILearningService.ts          # US-003: AI 學習服務
│   │       ├── SyncService.ts                # US-030: 同步服務
│   │       └── TelegramBotService.ts         # US-007: Telegram Bot 服務
│   │
│   ├── domain/                       # 領域層 (Business Logic)
│   │   ├── entities/
│   │   │   ├── Expense.ts                    # 支出實體
│   │   │   ├── Subscription.ts               # 訂閱實體
│   │   │   ├── User.ts                       # 用戶實體
│   │   │   ├── AILearningSample.ts           # AI 學習樣本
│   │   │   └── Notification.ts               # 通知實體
│   │   │
│   │   ├── value-objects/
│   │   │   ├── Money.ts                      # 金額值對象
│   │   │   ├── Category.ts                   # 分類值對象
│   │   │   ├── DateRange.ts                  # 日期範圍
│   │   │   └── BillingCycle.ts               # 扣款週期
│   │   │
│   │   ├── repositories/                     # 倉儲接口
│   │   │   ├── IExpenseRepository.ts
│   │   │   ├── ISubscriptionRepository.ts
│   │   │   ├── IUserRepository.ts
│   │   │   └── IAILearningSampleRepository.ts
│   │   │
│   │   └── events/                           # 領域事件 (對應 Event Storming)
│   │       ├── ExpenseCreated.ts             # US-001
│   │       ├── ExpenseUpdated.ts             # US-004
│   │       ├── ExpenseDeleted.ts             # US-004
│   │       ├── CategoryCorrected.ts          # US-003
│   │       ├── AILearned.ts                  # US-003
│   │       ├── FallbackModeActivated.ts      # US-002
│   │       ├── SubscriptionAdded.ts          # US-010
│   │       ├── SubscriptionCancelled.ts      # US-013
│   │       ├── SubscriptionPaused.ts         # US-013
│   │       ├── BillingReminderSent.ts        # US-011
│   │       ├── SubscriptionBilled.ts         # US-012
│   │       ├── BillingDateCalculated.ts      # US-010
│   │       ├── ExpenseAutoCreated.ts         # US-012
│   │       ├── NotificationSent.ts           # US-015
│   │       ├── NotificationFailed.ts         # US-015
│   │       ├── SyncConflictDetected.ts       # US-030
│   │       ├── TelegramLinked.ts             # US-007
│   │       ├── UserRegistered.ts             # US-005
│   │       ├── UserAuthenticated.ts          # US-005
│   │       ├── OnboardingStarted.ts          # US-006
│   │       ├── OnboardingCompleted.ts        # US-006
│   │       ├── AhaMomentReached.ts           # US-006
│   │       ├── MonthlyDataAggregated.ts      # US-020
│   │       ├── InsightsGenerated.ts          # US-021
│   │       ├── AnomalyDetected.ts            # US-021
│   │       └── TrendIdentified.ts            # US-021
│   │
│   ├── infrastructure/               # 基礎設施層
│   │   ├── database/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts                 # Supabase Client 實例
│   │   │   │   ├── migrations/               # 數據庫遷移
│   │   │   │   │   ├── 001_create_users.sql
│   │   │   │   │   ├── 002_create_expenses.sql
│   │   │   │   │   ├── 003_create_subscriptions.sql
│   │   │   │   │   ├── 004_create_ai_learning_samples.sql
│   │   │   │   │   ├── 005_create_notifications.sql
│   │   │   │   │   └── 006_enable_rls.sql
│   │   │   │   └── seed.ts                   # 種子數據
│   │   │   │
│   │   │   └── repositories/                 # 倉儲實現
│   │   │       ├── SupabaseExpenseRepository.ts
│   │   │       ├── SupabaseSubscriptionRepository.ts
│   │   │       ├── SupabaseUserRepository.ts
│   │   │       └── SupabaseAILearningSampleRepository.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── OpenAIClient.ts               # OpenAI GPT 客戶端
│   │   │   ├── prompts/
│   │   │   │   ├── expenseParserPrompt.ts    # 解析提示詞
│   │   │   │   └── insightGeneratorPrompt.ts # 洞察提示詞
│   │   │   └── fallback/
│   │   │       └── RuleEngine.ts             # US-002: 規則引擎
│   │   │
│   │   ├── notifications/
│   │   │   ├── EmailProvider.ts              # 郵件提供者 (Resend)
│   │   │   ├── PushProvider.ts               # 推送提供者 (FCM)
│   │   │   └── TelegramProvider.ts           # Telegram Bot
│   │   │
│   │   ├── auth/
│   │   │   └── SupabaseAuthService.ts        # Supabase Auth 服務
│   │   │
│   │   └── edge-functions/           # Supabase Edge Functions
│   │       ├── subscription-billing-check/   # US-011, US-012: 訂閱檢查
│   │       │   └── index.ts
│   │       ├── monthly-aggregation/          # US-020: 月度彙總
│   │       │   └── index.ts
│   │       └── ai-insights-generator/        # US-021: AI 洞察
│   │           └── index.ts
│   │
│   ├── shared/                       # 共享模塊
│   │   ├── types/
│   │   │   ├── api.types.ts                  # API 類型定義
│   │   │   ├── domain.types.ts               # 領域類型
│   │   │   ├── supabase.types.ts             # Supabase 類型
│   │   │   └── config.types.ts               # 配置類型
│   │   │
│   │   ├── constants/
│   │   │   ├── categories.ts                 # 分類常量
│   │   │   ├── errors.ts                     # 錯誤代碼
│   │   │   └── config.ts                     # 配置常量
│   │   │
│   │   ├── utils/
│   │   │   ├── dateUtils.ts                  # 日期工具
│   │   │   ├── validators.ts                 # 驗證器
│   │   │   ├── logger.ts                     # 日誌工具
│   │   │   └── errors.ts                     # 錯誤處理
│   │   │
│   │   └── middlewares/
│   │       ├── authMiddleware.ts             # 認證中間件
│   │       ├── errorHandler.ts               # 錯誤處理中間件
│   │       ├── rateLimiter.ts                # 速率限制
│   │       └── validator.ts                  # 驗證中間件
│   │
│   └── config/                       # 配置文件
│       ├── supabase.ts                       # Supabase 配置
│       ├── ai.ts                             # AI 配置
│       └── env.ts                            # 環境變量
│
├── supabase/                         # Supabase 項目配置
│   ├── config.toml                   # Supabase 配置
│   ├── migrations/                   # SQL 遷移文件
│   ├── functions/                    # Edge Functions
│   └── seed.sql                      # 種子數據
│
├── __tests__/                        # 測試目錄
│   ├── unit/                         # 單元測試
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/                  # 整合測試 (基於 User Story AC)
│   │   ├── api/
│   │   │   ├── expenses.spec.ts      # US-001, US-004
│   │   │   ├── subscriptions.spec.ts # US-010, US-011, US-012
│   │   │   └── sync.spec.ts          # US-030
│   │   └── database/
│   ├── e2e/                          # E2E 測試 (基於 User Story 場景)
│   │   ├── scenarios/
│   │   │   ├── onboarding-flow.spec.ts    # US-006
│   │   │   ├── expense-management.spec.ts # US-001~004
│   │   │   └── subscription-flow.spec.ts  # US-010~013
│   │   └── step-definitions/
│   └── fixtures/                     # 測試數據
│
├── .env.example                      # 環境變量範例
├── .env.local                        # 本地環境變量
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## 5. 數據庫設計

### 5.1 ER 圖

```
┌─────────────────┐         ┌──────────────────┐
│  auth.users     │1      * │    expenses      │
│  (Supabase)     │────────▶│──────────────────│
│─────────────────│         │ id (UUID)        │
│ id (UUID)       │         │ user_id (FK)     │
│ email           │         │ amount           │
│ created_at      │         │ category         │
└─────────────────┘         │ description      │
        │                   │ date             │
        │                   │ ai_confidence    │
        │                   │ fallback_used    │
        │                   │ version          │
        │                   │ sync_status      │
        │                   │ created_at       │
        │                   │ updated_at       │
        │                   └──────────────────┘
        │
        │1
        │
        │*
┌─────────────────┐         ┌──────────────────┐
│ subscriptions   │         │ai_learning_samples│
│─────────────────│         │──────────────────│
│ id (UUID)       │         │ id (UUID)        │
│ user_id (FK)    │         │ user_id (FK)     │
│ name            │         │ input_text       │
│ amount          │         │ correct_category │
│ billing_cycle   │         │ original_category│
│ next_billing    │         │ confidence       │
│ status          │         │ created_at       │
│ category        │         └──────────────────┘
│ total_paid      │
│ billing_count   │                │1
│ created_at      │                │
│ updated_at      │                │*
└─────────────────┘         ┌──────────────────┐
                            │  notifications   │
                            │──────────────────│
                            │ id (UUID)        │
                            │ user_id (FK)     │
                            │ type             │
                            │ title            │
                            │ message          │
                            │ status           │
                            │ sent_at          │
                            │ read_at          │
                            │ created_at       │
                            └──────────────────┘
```

### 5.2 表結構詳細設計

#### 5.2.1 auth.users (Supabase Auth 內建表)

Supabase 自動管理,包含以下核心欄位:
- `id`: UUID (主鍵)
- `email`: 郵箱
- `encrypted_password`: 加密密碼
- `email_confirmed_at`: Email 驗證時間
- `raw_user_meta_data`: JSON 格式用戶元數據
- `created_at`, `updated_at`: 時間戳

我們可以通過 `raw_user_meta_data` 存儲額外資訊:
```json
{
  "name": "用戶名",
  "avatar_url": "頭像 URL",
  "timezone": "Asia/Taipei",
  "preferences": {
    "notification_enabled": true,
    "language": "zh-TW"
  }
}
```

#### 5.2.2 public.expenses (支出記錄表)

```sql
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING',
    'HOUSING', 'MEDICAL', 'EDUCATION', 'SUBSCRIPTION',
    'OTHER', 'INCOME'
  )),
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- AI 相關字段
  ai_confidence INTEGER CHECK (ai_confidence BETWEEN 0 AND 100),
  fallback_used BOOLEAN DEFAULT FALSE,
  ai_model_version VARCHAR(50),

  -- 多設備同步字段 (US-030)
  version INTEGER DEFAULT 1,
  last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified_device VARCHAR(50),
  sync_status VARCHAR(20) DEFAULT 'SYNCED' CHECK (sync_status IN (
    'SYNCED', 'PENDING', 'CONFLICT'
  )),

  -- 審計字段
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE  -- 軟刪除 (US-004)
);

-- 索引優化
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX idx_expenses_user_category ON public.expenses(user_id, category);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_sync_status ON public.expenses(user_id, sync_status, last_modified_at);

-- Row Level Security (RLS)
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
```

**字段說明**:
- `amount`: 金額 (必須 > 0)
- `category`: 分類 (枚舉值)
- `description`: 描述
- `date`: 支出日期
- `ai_confidence`: AI 信心度 (0-100)
- `fallback_used`: 是否使用降級模式 (US-002)
- `version`: 版本號,用於同步衝突檢測 (US-030)
- `sync_status`: 同步狀態

#### 5.2.3 public.subscriptions (訂閱表)

```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
  next_billing_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN (
    'ACTIVE', 'CANCELLED', 'PAUSED'
  )),
  category VARCHAR(50) DEFAULT 'SUBSCRIPTION',

  -- 統計字段 (US-013)
  total_paid DECIMAL(12, 2) DEFAULT 0,
  billing_count INTEGER DEFAULT 0,
  first_billing_date DATE NOT NULL,

  -- 提醒設置 (US-011)
  notification_days INTEGER[] DEFAULT ARRAY[3, 1, 0],

  -- 暫停相關 (US-013)
  paused_until DATE,

  -- 審計字段
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_subscriptions_user_billing ON public.subscriptions(user_id, next_billing_date);
CREATE INDEX idx_subscriptions_status_billing ON public.subscriptions(status, next_billing_date);
CREATE INDEX idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
  ON public.subscriptions
  USING (auth.uid() = user_id);
```

**字段說明**:
- `name`: 訂閱名稱 (如 Netflix)
- `amount`: 訂閱金額
- `billing_cycle`: 扣款週期 (月/年)
- `next_billing_date`: 下次扣款日
- `status`: 狀態 (活躍/取消/暫停) - US-013
- `total_paid`: 累計已付金額
- `billing_count`: 扣款次數
- `notification_days`: 提醒天數數組 - US-011
- `paused_until`: 暫停至日期 - US-013

#### 5.2.4 public.ai_learning_samples (AI 學習樣本表)

```sql
CREATE TABLE public.ai_learning_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  correct_category VARCHAR(50) NOT NULL,
  original_category VARCHAR(50),
  original_confidence INTEGER,

  -- 學習元數據 (US-003)
  correction_type VARCHAR(20) CHECK (correction_type IN (
    'USER_CORRECTION', 'BATCH_CORRECTION', 'AUTO_LEARN'
  )),
  learned BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_ai_samples_user_input ON public.ai_learning_samples(user_id, input_text);
CREATE INDEX idx_ai_samples_user_category ON public.ai_learning_samples(user_id, correct_category);
CREATE INDEX idx_ai_samples_learned ON public.ai_learning_samples(user_id, learned);

-- RLS
ALTER TABLE public.ai_learning_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own learning samples"
  ON public.ai_learning_samples
  USING (auth.uid() = user_id);
```

**字段說明** (基於 US-003):
- `input_text`: 原始輸入文本
- `correct_category`: 正確分類
- `original_category`: AI 原始判斷
- `original_confidence`: 原始信心度
- `correction_type`: 修正類型
- `learned`: 是否已被 AI 學習

#### 5.2.5 public.notifications (通知表)

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'SUBSCRIPTION_REMINDER',  -- US-011
    'BILLING_COMPLETE',       -- US-012
    'INSIGHT',                -- US-021
    'SYSTEM'
  )),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,

  -- 通知狀態 (US-015)
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'SENT', 'FAILED', 'READ'
  )),

  -- 通知渠道 (US-015)
  channels VARCHAR(20)[] DEFAULT ARRAY['PUSH'],

  -- 關聯數據
  related_entity_type VARCHAR(50),
  related_entity_id UUID,

  -- 時間戳
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_notifications_user_status ON public.notifications(user_id, status);
CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_type_status ON public.notifications(type, status);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 5.2.6 public.user_profiles (用戶擴展信息表)

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'Asia/Taipei',

  -- Onboarding 相關 (US-006)
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  aha_moment_reached BOOLEAN DEFAULT FALSE,
  aha_moment_reached_at TIMESTAMP WITH TIME ZONE,

  -- Telegram 相關 (US-007)
  telegram_id VARCHAR(50) UNIQUE,
  telegram_username VARCHAR(100),
  telegram_linked_at TIMESTAMP WITH TIME ZONE,

  -- 偏好設置
  preferences JSONB DEFAULT '{
    "notification_enabled": true,
    "language": "zh-TW",
    "currency": "TWD"
  }'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON public.user_profiles
  USING (auth.uid() = id);
```

### 5.3 數據庫觸發器

```sql
-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 自動計算下次扣款日 (US-010)
CREATE OR REPLACE FUNCTION calculate_next_billing()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.billing_cycle = 'MONTHLY' THEN
    NEW.next_billing_date = NEW.next_billing_date + INTERVAL '1 month';
  ELSIF NEW.billing_cycle = 'YEARLY' THEN
    NEW.next_billing_date = NEW.next_billing_date + INTERVAL '1 year';
  END IF;

  -- 處理月底邊界情況
  IF EXTRACT(DAY FROM NEW.next_billing_date) > EXTRACT(DAY FROM NEW.first_billing_date) THEN
    NEW.next_billing_date = DATE_TRUNC('month', NEW.next_billing_date) + INTERVAL '1 month' - INTERVAL '1 day';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 5.4 Supabase Realtime 配置 (US-030)

```sql
-- 啟用 Realtime 訂閱
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 只推送用戶自己的數據變更
CREATE POLICY "Realtime: Users can listen to their own data"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 6. API 接口設計

### 6.1 認證相關 API (基於 US-005)

Supabase Auth 提供內建認證 API,我們主要使用 Supabase JS SDK:

#### 6.1.1 Google OAuth 註冊/登入

```typescript
// 前端調用
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/api/auth/callback`
  }
});
```

#### 6.1.2 Email + 密碼註冊

```typescript
// POST /api/auth/register (透過 Supabase SDK)
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'SecurePass123!',
  options: {
    data: {
      name: '用戶名',
      timezone: 'Asia/Taipei'
    }
  }
});

// 響應
{
  user: {
    id: "uuid",
    email: "test@example.com",
    user_metadata: {
      name: "用戶名",
      timezone: "Asia/Taipei"
    }
  },
  session: {
    access_token: "jwt_token",
    refresh_token: "refresh_token",
    expires_at: 1234567890
  }
}
```

#### 6.1.3 GET /api/auth/session

```typescript
// 獲取當前會話
const { data: { session } } = await supabase.auth.getSession();

// 響應
{
  access_token: "jwt_token",
  refresh_token: "refresh_token",
  expires_at: 1234567890,
  user: {
    id: "uuid",
    email: "test@example.com"
  }
}
```

#### 6.1.4 POST /api/auth/signout

```typescript
const { error } = await supabase.auth.signOut();
```

---

### 6.2 支出管理 API (基於 US-001, US-002, US-003, US-004)

#### 6.2.1 POST /api/expenses/parse (US-001: AI 自然語言解析)

**功能**: 解析自然語言輸入並創建支出記錄

**請求頭**:
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

**請求體**:
```typescript
{
  text: string;        // "早餐 65"
  timezone?: string;   // 可選,默認 'Asia/Taipei'
}
```

**響應** (成功 200 OK):
```typescript
{
  success: true;
  data: {
    id: string;
    amount: number;           // 65
    category: Category;       // 'FOOD'
    description: string;      // '早餐'
    date: string;            // ISO8601 格式
    ai_confidence: number;   // 95
    fallback_used: boolean;  // false (US-002)
    suggestions?: string[];  // ['餐飲', '咖啡']
  };
  meta: {
    processing_time: number;  // 450 (ms)
    model_used: string;       // 'claude-3-5-sonnet'
  };
}
```

**響應** (錯誤 - 缺少金額 400):
```typescript
{
  success: false;
  error: {
    code: 'MISSING_AMOUNT';
    message: '忘記填金額了嗎？試試看「午餐 120」';
    suggestion: '請輸入格式：描述 + 空格 + 金額';
  };
}
```

**響應** (AI 降級模式 200 - US-002):
```typescript
{
  success: true;
  data: {
    amount: 150;
    category: 'FOOD';
    description: '星巴克拿鐵';
    date: '2025-01-19T00:00:00+08:00';
    ai_confidence: 70;       // 降級後信心度較低
    fallback_used: true;     // 標記使用降級模式
  };
  warning: {
    code: 'AI_FALLBACK_MODE';
    message: 'AI 小幫手暫時休息中，已切換到基本模式';
  };
}
```

#### 6.2.2 POST /api/expenses/correct (US-003: 分類修正與學習)

**功能**: 修正 AI 錯誤分類並觸發學習

**請求體**:
```typescript
{
  expense_id: string;
  correct_category: Category;
  reason?: string;  // 可選的修正原因
}
```

**響應**:
```typescript
{
  success: true;
  data: {
    expense: {
      id: string;
      category: Category;  // 已更新
      version: number;     // version + 1
      updated_at: string;
    };
    learning_sample: {
      id: string;
      input_text: string;
      correct_category: Category;
      learned: boolean;
    };
  };
  message: '已更新！AI 會記住這個修正 🧠';
}
```

#### 6.2.3 GET /api/expenses (US-004)

**功能**: 查詢支出列表

**查詢參數**:
```typescript
{
  month?: string;      // '2025-01' (可選,默認當前月)
  category?: Category; // 'FOOD' (可選)
  limit?: number;      // 50 (可選,默認 100)
  offset?: number;     // 0 (可選,用於分頁)
  sort?: 'date' | 'amount';
  order?: 'asc' | 'desc';
}
```

**響應**:
```typescript
{
  success: true;
  data: {
    expenses: [
      {
        id: string;
        amount: number;
        category: Category;
        description: string;
        date: string;
        ai_confidence: number;
        fallback_used: boolean;
        version: number;
        created_at: string;
        updated_at: string;
      }
      // ...
    ];
    summary: {
      total: number;           // 總金額 12450
      count: number;           // 記錄數 28
      by_category: {
        FOOD: number;          // 5200
        TRANSPORT: number;     // 1500
        SUBSCRIPTION: number;  // 539
        // ...
      };
    };
    pagination: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  };
}
```

#### 6.2.4 PUT /api/expenses/:id (US-004: 更新支出)

**請求體**:
```typescript
{
  amount?: number;
  category?: Category;
  description?: string;
  date?: string;
  version: number;  // 必須,用於樂觀鎖 (US-030)
}
```

**響應** (成功 200):
```typescript
{
  success: true;
  data: {
    id: string;
    amount: number;
    category: Category;
    description: string;
    date: string;
    version: number;  // version + 1
    updated_at: string;
  };
  message: '已更新！';
}
```

**響應** (衝突 409 - US-030):
```typescript
{
  success: false;
  error: {
    code: 'SYNC_CONFLICT';
    message: '資料已在其他裝置更新，要重新載入嗎？';
    current_version: number;
  };
}
```

#### 6.2.5 DELETE /api/expenses/:id (US-004: 軟刪除)

**響應**:
```typescript
{
  success: true;
  message: '已刪除';
}
```

---

### 6.3 訂閱管理 API (基於 US-010, US-011, US-012, US-013)

#### 6.3.1 POST /api/subscriptions (US-010: 創建訂閱)

**請求體**:
```typescript
{
  name: string;                           // 'Netflix'
  amount: number;                         // 390
  billing_cycle: 'MONTHLY' | 'YEARLY';    // 'MONTHLY'
  first_billing_date: string;             // '2025-01-15' (ISO8601)
  category?: Category;                    // 可選,默認 'SUBSCRIPTION'
  notification_days?: number[];           // 可選,默認 [3, 1, 0]
}
```

**響應** (201 Created):
```typescript
{
  success: true;
  data: {
    id: string;
    name: string;
    amount: number;
    billing_cycle: 'MONTHLY' | 'YEARLY';
    next_billing_date: string;     // '2025-02-15' (自動計算)
    status: 'ACTIVE';
    days_until_billing: number;    // 26
    created_at: string;
  };
  message: '已新增 Netflix';
}
```

#### 6.3.2 POST /api/subscriptions/:id/cancel (US-013: 取消訂閱)

**請求體**:
```typescript
{
  reason?: string;  // 可選的取消原因
}
```

**響應**:
```typescript
{
  success: true;
  data: {
    id: string;
    status: 'CANCELLED';
    cancelled_at: string;
  };
  message: '已取消訂閱';
}
```

#### 6.3.3 POST /api/subscriptions/:id/pause (US-013: 暫停訂閱)

**請求體**:
```typescript
{
  paused_until: string;  // '2025-12-31' (ISO8601)
}
```

**響應**:
```typescript
{
  success: true;
  data: {
    id: string;
    status: 'PAUSED';
    paused_until: string;
  };
  message: '已暫停訂閱';
}
```

#### 6.3.4 GET /api/subscriptions/summary

**響應**:
```typescript
{
  success: true;
  data: {
    total_monthly: number;      // 614
    total_yearly: number;       // 7368
    active_count: number;       // 3
    upcoming_billing: [
      {
        subscription_id: string;
        name: string;
        amount: number;
        billing_date: string;
        days_until: number;
      }
      // 最近 3 個即將扣款的訂閱
    ];
  };
}
```

---

### 6.4 智能分析 API (基於 US-020, US-021)

#### 6.4.1 GET /api/insights/monthly (US-020: 月度洞察)

**查詢參數**:
```typescript
{
  month?: string;  // '2025-01' (可選,默認當前月)
}
```

**響應**:
```typescript
{
  success: true;
  data: {
    month: string;
    total_expense: number;
    total_income: number;
    net: number;

    // 分類佔比
    category_breakdown: [
      {
        category: Category;
        amount: number;
        percentage: number;
        count: number;
      }
      // ...
    ];

    // AI 洞察 (US-021)
    insights: [
      {
        type: 'TREND' | 'ANOMALY' | 'SUGGESTION';
        title: string;
        message: string;
        severity: 'INFO' | 'WARNING' | 'CRITICAL';
        data?: any;
      }
      // 例如:
      // {
      //   type: 'ANOMALY',
      //   title: '娛樂支出異常',
      //   message: '本月娛樂支出 $3,200，比上月多 65%',
      //   severity: 'WARNING'
      // }
    ];

    // 與上月比較
    comparison: {
      expense_change: number;    // 0.15 (增加 15%)
      income_change: number;     // -0.05 (減少 5%)
      top_increased_category: string;
      top_decreased_category: string;
    };
  };
}
```

#### 6.4.2 GET /api/insights/anomalies (US-021: 異常檢測)

**響應**:
```typescript
{
  success: true;
  data: {
    anomalies: [
      {
        expense_id: string;
        amount: number;
        date: string;
        category: string;
        deviation: number;        // 偏離標準差的倍數
        reason: string;           // '單筆金額異常高'
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
      }
    ];
    statistics: {
      total_anomalies: number;
      average_deviation: number;
    };
  };
}
```

---

### 6.5 通知管理 API (基於 US-015)

#### 6.5.1 GET /api/notifications

**查詢參數**:
```typescript
{
  status?: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  type?: 'SUBSCRIPTION_REMINDER' | 'BILLING_COMPLETE' | 'INSIGHT' | 'SYSTEM';
  limit?: number;
  offset?: number;
}
```

**響應**:
```typescript
{
  success: true;
  data: {
    notifications: [
      {
        id: string;
        type: string;
        title: string;
        message: string;
        status: string;
        channels: string[];
        sent_at: string | null;
        read_at: string | null;
        created_at: string;
      }
    ];
    unread_count: number;
    pagination: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  };
}
```

#### 6.5.2 PUT /api/notifications/:id/read

**響應**:
```typescript
{
  success: true;
  message: '已標記為已讀';
}
```

---

### 6.6 Telegram Bot API (基於 US-007)

#### 6.6.1 POST /api/telegram/link

**功能**: 綁定 Telegram 帳號

**請求體**:
```typescript
{
  telegram_id: string;
  username?: string;
}
```

**響應**:
```typescript
{
  success: true;
  message: 'Telegram 已連結';
}
```

#### 6.6.2 POST /api/telegram/webhook

**功能**: 接收 Telegram Bot 訊息

由 Telegram 服務器調用,處理用戶透過 Bot 發送的記帳請求。

---

### 6.7 多設備同步 API (基於 US-030)

#### 6.7.1 POST /api/sync

**請求體**:
```typescript
{
  device_id: string;
  last_sync_at: string;  // ISO8601
  changes: [
    {
      entity_type: 'EXPENSE' | 'SUBSCRIPTION';
      entity_id: string;
      action: 'CREATE' | 'UPDATE' | 'DELETE';
      version: number;
      data: any;
      timestamp: string;
    }
  ];
}
```

**響應**:
```typescript
{
  success: true;
  data: {
    server_changes: [
      {
        entity_type: 'EXPENSE' | 'SUBSCRIPTION';
        entity_id: string;
        action: 'CREATE' | 'UPDATE' | 'DELETE';
        version: number;
        data: any;
        timestamp: string;
      }
    ];
    conflicts: [
      {
        entity_type: string;
        entity_id: string;
        client_version: number;
        server_version: number;
        resolution: 'CLIENT_WINS' | 'SERVER_WINS' | 'MANUAL';
      }
    ];
    sync_timestamp: string;
  };
}
```

---

### 6.8 Onboarding API (基於 US-006)

#### 6.8.1 POST /api/onboarding/complete

**請求體**:
```typescript
{
  first_expense_id?: string;  // 首次記帳的支出 ID
}
```

**響應**:
```typescript
{
  success: true;
  data: {
    onboarding_completed: true;
    aha_moment_reached: true;
    completed_at: string;
  };
  message: '🎉 完成首次記帳！';
}
```

---

## 7. 核心業務邏輯

### 7.1 AI 解析流程 (US-001, US-002)

```typescript
// src/application/services/AIParserService.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export class AIParserService {
  private supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  private openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });

  async parse(input: string, userId: string): Promise<ParsedExpense> {
    // 1. 輸入驗證
    this.validateInput(input);

    // 2. 獲取用戶學習樣本 (US-003)
    const learningSamples = await this.getLearningSamples(userId);

    // 3. 調用 OpenAI GPT (US-001)
    try {
      const result = await this.parseWithGPT(input, learningSamples);

      // 4. 驗證結果
      this.validateResult(result);

      // 5. 保存到 Supabase
      const { data, error } = await this.supabase
        .from('expenses')
        .insert({
          user_id: userId,
          ...result,
          fallback_used: false
        })
        .select()
        .single();

      if (error) throw error;

      // 6. 觸發事件
      await this.publishEvent('ExpenseCreated', data);

      return data;
    } catch (error) {
      // 7. 降級到規則引擎 (US-002)
      console.error('AI parsing failed, using fallback:', error);
      const fallbackResult = await this.fallbackParser.parse(input);

      // 保存降級結果
      const { data } = await this.supabase
        .from('expenses')
        .insert({
          user_id: userId,
          ...fallbackResult,
          fallback_used: true,
          ai_confidence: 70
        })
        .select()
        .single();

      // 觸發降級事件
      await this.publishEvent('FallbackModeActivated', { userId, error: error.message });

      return data;
    }
  }

  private async parseWithGPT(input: string, context: AILearningSample[]): Promise<any> {
    const prompt = this.buildPrompt(input, context);

    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'system',
        content: this.buildSystemPrompt(context)
      }, {
        role: 'user',
        content: input
      }]
    });

    return this.parseResponse(response);
  }
}
```

### 7.2 下次扣款日計算 (US-010)

```typescript
// src/application/use-cases/subscriptions/calculateNextBilling.ts
export function calculateNextBilling(
  lastBillingDate: Date,
  billingCycle: 'MONTHLY' | 'YEARLY'
): Date {
  const next = new Date(lastBillingDate);

  if (billingCycle === 'MONTHLY') {
    next.setMonth(next.getMonth() + 1);

    // 處理月底邊界情況 (閏年、短月份)
    if (next.getDate() !== lastBillingDate.getDate()) {
      next.setDate(0); // 設置為上月最後一天
    }
  } else {
    next.setFullYear(next.getFullYear() + 1);

    // 處理閏年情況 (2024/2/29 → 2025/2/28)
    if (next.getMonth() !== lastBillingDate.getMonth()) {
      next.setDate(0);
    }
  }

  return next;
}
```

### 7.3 訂閱提醒調度 (US-011, US-012)

使用 Supabase Edge Function 實現定時任務:

```typescript
// supabase/functions/subscription-billing-check/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const today = new Date();

  // 查詢狀態為 ACTIVE 的訂閱
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*, user_profiles(telegram_id)')
    .eq('status', 'ACTIVE');

  if (error) throw error;

  for (const sub of subscriptions) {
    const daysUntil = differenceInDays(new Date(sub.next_billing_date), today);

    // US-011: 檢查是否需要發送提醒
    if (sub.notification_days.includes(daysUntil)) {
      await sendBillingReminder(sub, daysUntil);
    }

    // US-012: 扣款當天自動創建支出記錄
    if (daysUntil === 0) {
      await processSubscriptionBilling(sub);
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

async function processSubscriptionBilling(subscription) {
  const supabase = createClient(...);

  // 創建支出記錄
  await supabase.from('expenses').insert({
    user_id: subscription.user_id,
    amount: subscription.amount,
    category: 'SUBSCRIPTION',
    description: `${subscription.name} (自動記帳)`,
    date: new Date().toISOString(),
    ai_confidence: 100,
    fallback_used: false
  });

  // 更新訂閱
  const nextBilling = calculateNextBilling(
    new Date(subscription.next_billing_date),
    subscription.billing_cycle
  );

  await supabase
    .from('subscriptions')
    .update({
      next_billing_date: nextBilling.toISOString(),
      total_paid: subscription.total_paid + subscription.amount,
      billing_count: subscription.billing_count + 1
    })
    .eq('id', subscription.id);

  // 觸發事件
  await publishEvent('SubscriptionBilled', { subscriptionId: subscription.id });
}
```

### 7.4 多設備同步與衝突解決 (US-030)

```typescript
// src/application/use-cases/sync/detectConflicts.ts
export async function detectConflicts(
  clientChanges: Change[],
  userId: string
): Promise<Conflict[]> {
  const supabase = createClient(...);
  const conflicts: Conflict[] = [];

  for (const change of clientChanges) {
    // 獲取服務器最新版本
    const { data: serverEntity } = await supabase
      .from(change.entity_type.toLowerCase())
      .select('version')
      .eq('id', change.entity_id)
      .eq('user_id', userId)
      .single();

    // 檢查版本衝突
    if (serverEntity && serverEntity.version !== change.version) {
      conflicts.push({
        entity_type: change.entity_type,
        entity_id: change.entity_id,
        client_version: change.version,
        server_version: serverEntity.version,
        resolution: 'MANUAL' // 需要用戶手動解決
      });

      // 觸發衝突事件
      await publishEvent('SyncConflictDetected', {
        userId,
        entityId: change.entity_id,
        entityType: change.entity_type
      });
    }
  }

  return conflicts;
}
```

---

## 8. AI 整合方案

### 8.1 OpenAI GPT 配置

```typescript
// src/lib/ai/parser.ts
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export class AIParserService {
  private client: OpenAI;
  private supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async parse(input: string, userId: string): Promise<ParsedExpense> {
    // 獲取用戶學習樣本 (US-003)
    const { data: learningSamples } = await this.supabase
      .from('ai_learning_samples')
      .select('original_input, corrected_category')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const learningContext = this.buildLearningContext(learningSamples || []);

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'system',
        content: this.buildSystemPrompt(learningContext)
      }, {
        role: 'user',
        content: input
      }]
    });

    return this.parseResponse(response);
  }

  private buildPrompt(input: string, context: AILearningSample[]): string {
    return `
你是一個智能記帳助手,負責解析用戶的自然語言輸入。

## 任務
從用戶輸入中提取以下信息:
1. 金額 (amount): 必須是正數
2. 分類 (category): FOOD, TRANSPORT, ENTERTAINMENT, SHOPPING, HOUSING, MEDICAL, EDUCATION, SUBSCRIPTION, OTHER, INCOME
3. 描述 (description): 簡短描述
4. 日期 (date): 相對日期(今天、昨天、前天等)或絕對日期

## 用戶偏好 (從歷史學習)
${context.map(c => `- "${c.input_text}" → ${c.correct_category}`).join('\n')}

## 用戶輸入
${input}

## 輸出格式 (JSON)
{
  "amount": number,
  "category": "FOOD" | "TRANSPORT" | ...,
  "description": string,
  "date": "today" | "yesterday" | "YYYY-MM-DD",
  "confidence": number (0-100)
}

請直接返回 JSON,不要有其他文字。
`;
  }
}
```

### 8.2 規則引擎降級方案 (US-002)

```typescript
// src/infrastructure/ai/fallback/RuleEngine.ts
export class RuleBasedParser {
  private categoryRules = {
    FOOD: ['早餐', '午餐', '晚餐', '宵夜', '星巴克', '麥當勞', '咖啡', '火鍋'],
    TRANSPORT: ['Uber', '計程車', '捷運', '公車', '高鐵', '台鐵', '加油'],
    SUBSCRIPTION: ['Netflix', 'Spotify', 'Disney', 'YouTube Premium', 'ChatGPT'],
    ENTERTAINMENT: ['電影', 'KTV', '遊戲', '演唱會'],
    // ...
  };

  parse(input: string): ParsedExpense {
    // 1. 提取金額
    const amount = this.extractAmount(input);
    if (!amount) {
      throw new Error('MISSING_AMOUNT');
    }

    // 2. 提取描述
    const description = input.replace(/\d+/g, '').trim();

    // 3. 匹配分類
    const category = this.matchCategory(description);

    // 4. 提取日期
    const date = this.extractDate(input);

    return {
      amount,
      category,
      description,
      date,
      confidence: 70,  // 規則引擎信心度固定為 70
      fallback_used: true
    };
  }

  private matchCategory(description: string): Category {
    for (const [category, keywords] of Object.entries(this.categoryRules)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        return category as Category;
      }
    }
    return 'OTHER';
  }
}
```

---

## 9. 安全與認證

### 9.1 Supabase Auth 配置

Supabase Auth 提供內建的認證功能,支持:
- Email + 密碼登入
- Google OAuth
- JWT Token 自動管理
- Session 刷新
- Row Level Security (RLS)

#### 9.1.1 Google OAuth 配置

在 Supabase Dashboard 配置:

```bash
# 1. 在 Google Cloud Console 創建 OAuth 2.0 憑證
# 2. 在 Supabase Dashboard > Authentication > Providers
#    啟用 Google Provider
# 3. 填入 Google Client ID 和 Client Secret
```

#### 9.1.2 前端調用範例

```typescript
// 前端: Google OAuth 登入
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/api/auth/callback`,
    scopes: 'email profile'
  }
});

// Email 登入
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
});

// 獲取當前會話
const { data: { session } } = await supabase.auth.getSession();
```

### 9.2 認證中間件

```typescript
// src/shared/middlewares/authMiddleware.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: '未登入' } },
      { status: 401 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 驗證 JWT Token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: '登入已過期' } },
      { status: 401 }
    );
  }

  // 將 userId 添加到請求上下文
  req.userId = user.id;

  return NextResponse.next();
}
```

### 9.3 Row Level Security (RLS)

Supabase RLS 確保用戶只能訪問自己的數據:

```sql
-- 用戶只能查看自己的支出
CREATE POLICY "Users can view their own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

-- 用戶只能創建自己的支出
CREATE POLICY "Users can insert their own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用戶只能更新自己的支出
CREATE POLICY "Users can update their own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);
```

### 9.4 速率限制

```typescript
// src/shared/middlewares/rateLimiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

// AI 解析速率限制: 每天 20 次 (US-001)
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 d'),
  prefix: 'ai-parse'
});

// API 速率限制: 每分鐘 60 次
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'api'
});
```

---

## 10. 部署與運維

### 10.1 環境變量

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# OpenAI
OPENAI_API_KEY="sk-..."

# Resend (Email)
RESEND_API_KEY="re_..."

# Firebase Cloud Messaging (Push 通知)
FCM_SERVER_KEY="your-fcm-server-key"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"

# Upstash Redis (速率限制)
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."

# Sentry (錯誤監控)
SENTRY_DSN="https://...@sentry.io/..."

# 環境
NODE_ENV="development" # development | production | test
```

### 10.2 Supabase 本地開發

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 初始化項目
supabase init

# 啟動本地 Supabase
supabase start

# 創建遷移
supabase migration new create_expenses_table

# 運行遷移
supabase db push

# 生成 TypeScript 類型
supabase gen types typescript --local > src/shared/types/supabase.types.ts
```

### 10.3 Vercel 部署

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### 10.4 Supabase Edge Functions 部署

```bash
# 部署單個 Edge Function
supabase functions deploy subscription-billing-check

# 設置環境變量
supabase secrets set OPENAI_API_KEY=sk-...

# 調用 Edge Function (測試)
supabase functions invoke subscription-billing-check

# 設置 Cron Job (在 Supabase Dashboard)
# Cron Expression: 0 0 * * * (每天 00:00 執行)
```

### 10.5 監控與日誌

```typescript
// src/shared/utils/logger.ts
import * as Sentry from '@sentry/node';

// Sentry 初始化
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// 錯誤捕獲
export function captureError(error: Error, context?: any) {
  console.error(error.message, { stack: error.stack, context });
  Sentry.captureException(error, { extra: context });
}

// 事件追蹤
export function trackEvent(eventName: string, properties?: any) {
  // 可整合 Mixpanel / Google Analytics
  console.log(`Event: ${eventName}`, properties);
}
```

### 10.6 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Supabase CLI
        run: npm install -g supabase

      - name: Start Supabase
        run: supabase start

      - name: Run migrations
        run: supabase db push

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          SUPABASE_URL: http://localhost:54321
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Check coverage
        run: npm run test:coverage

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Deploy Edge Functions
        run: |
          supabase functions deploy subscription-billing-check
          supabase functions deploy monthly-aggregation
          supabase functions deploy ai-insights-generator
```

---

## 附錄

### A. 常用命令

```bash
# 開發
npm run dev

# 構建
npm run build

# 測試
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage

# Supabase
supabase start             # 啟動本地 Supabase
supabase stop              # 停止本地 Supabase
supabase status            # 查看狀態
supabase db reset          # 重置數據庫
supabase gen types typescript --local  # 生成類型

# Edge Functions
supabase functions new my-function     # 創建新函數
supabase functions serve my-function   # 本地測試
supabase functions deploy my-function  # 部署

# 代碼檢查
npm run lint
npm run format
npm run type-check
```

### B. User Story 映射表

| Story ID | 功能 | 對應 API | 對應 Event |
|----------|------|---------|-----------|
| US-001 | AI 自然語言解析 | POST /api/expenses/parse | ExpenseCreated |
| US-002 | AI 降級機制 | (內建於 US-001) | FallbackModeActivated |
| US-003 | 分類修正與學習 | POST /api/expenses/correct | CategoryCorrected, AILearned |
| US-004 | 支出 CRUD | GET/POST/PUT/DELETE /api/expenses | ExpenseUpdated, ExpenseDeleted |
| US-005 | 用戶註冊登入 | Supabase Auth API | UserRegistered, UserAuthenticated |
| US-006 | Onboarding 流程 | POST /api/onboarding/complete | OnboardingCompleted, AhaMomentReached |
| US-007 | Telegram Bot | POST /api/telegram/* | TelegramLinked |
| US-010 | 新增訂閱 | POST /api/subscriptions | SubscriptionAdded, BillingDateCalculated |
| US-011 | 訂閱提醒 | Edge Function (Cron) | BillingReminderSent |
| US-012 | 訂閱自動記帳 | Edge Function (Cron) | SubscriptionBilled, ExpenseAutoCreated |
| US-013 | 訂閱管理操作 | POST /api/subscriptions/:id/cancel | SubscriptionCancelled, SubscriptionPaused |
| US-015 | 推播通知基礎 | NotificationService | NotificationSent, NotificationFailed |
| US-020 | 月度彙總 | GET /api/insights/monthly | MonthlyDataAggregated |
| US-021 | AI 洞察 | GET /api/insights/anomalies | InsightsGenerated, AnomalyDetected |
| US-030 | 多設備同步 | POST /api/sync | SyncConflictDetected |
| US-031 | 監控追蹤 | Sentry + Prometheus | - |

### C. 性能優化建議

1. **Supabase 查詢優化**
   - 使用合適的索引
   - 避免 N+1 查詢
   - 使用 `select()` 限制返回字段

2. **緩存策略**
   - AI 解析結果緩存 (Upstash Redis)
   - 用戶分類偏好永久緩存
   - 月度統計緩存 1 小時

3. **Supabase Realtime 優化**
   - 只訂閱必要的表
   - 使用 RLS 過濾數據
   - 適當的重連策略

4. **Edge Functions 優化**
   - 使用 Deno Deploy 的全球 CDN
   - 冷啟動優化
   - 合理設置超時時間

---

**文檔版本**: v2.0 (Supabase Edition)
**最後更新**: 2025-10-24
**基於**: User Story v1.0, Event Storming v1.0
**維護團隊**: QuickSmart Backend Team
