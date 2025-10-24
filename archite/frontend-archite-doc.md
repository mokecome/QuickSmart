# QuickSmart 智能記帳 - 前端架構設計文檔

**版本**: v1.0
**最後更新**: 2025-10-23
**技術棧**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
**架構模式**: Feature-Sliced Design + Atomic Design

---

## 目錄

1. [架構概述](#1-架構概述)
2. [技術選型](#2-技術選型)
3. [系統架構](#3-系統架構)
4. [項目目錄結構](#4-項目目錄結構)
5. [組件設計](#5-組件設計)
6. [狀態管理](#6-狀態管理)
7. [路由設計](#7-路由設計)
8. [UI 設計系統](#8-ui-設計系統)
9. [性能優化](#9-性能優化)
10. [測試策略](#10-測試策略)

---

## 1. 架構概述

### 1.1 設計原則

- **組件化開發**: 可重用的 UI 組件
- **類型安全**: TypeScript 嚴格模式
- **響應式設計**: Mobile First 策略
- **漸進式增強**: 基礎功能優先，逐步增強
- **無障礙友好**: WCAG 2.1 AA 標準
- **性能優先**: Core Web Vitals 優化

### 1.2 架構層次

```
┌─────────────────────────────────────────┐
│         Pages (路由層)                   │  Next.js App Router
├─────────────────────────────────────────┤
│         Features (功能模塊)              │  業務功能封裝
├─────────────────────────────────────────┤
│         Widgets (組合組件)               │  複雜業務組件
├─────────────────────────────────────────┤
│         Components (基礎組件)            │  UI 組件庫
├─────────────────────────────────────────┤
│         Shared (共享資源)                │  工具/類型/常量
└─────────────────────────────────────────┘
```

### 1.3 核心特性

- ✅ Server Components 優先
- ✅ 客戶端狀態管理 (Zustand)
- ✅ 樂觀更新 (Optimistic UI)
- ✅ 無限滾動分頁
- ✅ 實時通知
- ✅ PWA 支持
- ✅ 離線優先
- ✅ 深色模式

---

## 2. 技術選型

### 2.1 核心技術

| 技術 | 版本 | 用途 | 原因 |
|------|------|------|------|
| **Next.js** | 14.x | React 框架 | SSR/SSG/ISR 支持 |
| **React** | 18.x | UI 庫 | 最流行、生態豐富 |
| **TypeScript** | 5.x | 開發語言 | 類型安全、開發體驗好 |
| **Tailwind CSS** | 3.x | CSS 框架 | 快速開發、高度可定制 |
| **Zustand** | 4.x | 狀態管理 | 輕量、簡單、高效 |
| **React Query** | 5.x | 服務端狀態 | 數據獲取、緩存、同步 |

### 2.2 UI 組件庫

| 庫 | 用途 | 原因 |
|------|------|------|
| **shadcn/ui** | 基礎組件 | 無依賴、可定制、Radix UI |
| **Headless UI** | 無頭組件 | 無樣式、可訪問性好 |
| **Framer Motion** | 動畫 | 聲明式、性能好 |
| **Chart.js** | 圖表 | 輕量、易用 |
| **React Hot Toast** | 通知 | 簡潔、美觀 |

### 2.3 開發工具

| 工具 | 用途 |
|------|------|
| **Vitest** | 單元測試 |
| **Testing Library** | 組件測試 |
| **Playwright** | E2E 測試 |
| **Storybook** | 組件文檔 |
| **ESLint** | 代碼檢查 |
| **Prettier** | 代碼格式化 |
| **Husky** | Git Hooks |

---

## 3. 系統架構

### 3.1 架構圖

```
┌─────────────────────────────────────────────┐
│              用戶瀏覽器                       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│           Next.js App Router                │
│  ┌────────┬────────┬────────┬────────┐      │
│  │ Home   │Expense │Subscr. │Insight │      │
│  │ Page   │ Page   │ Page   │ Page   │      │
│  └────────┴────────┴────────┴────────┘      │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│   Features   │  │   Widgets    │
│ (功能模塊)    │  │ (組合組件)    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│          Components (UI 組件庫)              │
│  ┌──────────────────────────────────────┐   │
│  │ Button, Input, Card, Modal, etc.    │   │
│  └──────────────────────────────────────┘   │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│   Zustand    │  │ React Query  │
│ (客戶端狀態)  │  │ (服務端狀態)  │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   Backend    │
                  │     API      │
                  └──────────────┘
```

### 3.2 數據流向

#### 3.2.1 用戶記帳流程

```
用戶輸入 → ExpenseInput (組件)
           ↓
       表單驗證
           ↓
       樂觀更新 (Zustand)
           ↓
       API 調用 (React Query)
           ↓
    ┌──────┴──────┐
成功 ↓             ↓ 失敗
更新 UI       回滾 + 錯誤提示
    ↓
刷新列表
```

#### 3.2.2 狀態同步流程

```
用戶操作 → 本地狀態更新 (Zustand)
              ↓
         後台同步 (React Query)
              ↓
      ┌───────┴───────┐
      │               │
  成功 ↓               ↓ 失敗
  標記同步完成    重試機制
                      ↓
                   離線隊列
```

---

## 4. 項目目錄結構

```
quicksmart-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # 認證路由組
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # /login
│   │   │   ├── register/
│   │   │   │   └── page.tsx          # /register
│   │   │   └── layout.tsx            # 認證布局
│   │   │
│   │   ├── (dashboard)/              # 主要應用路由組
│   │   │   ├── expenses/
│   │   │   │   ├── page.tsx          # /expenses
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # /expenses/:id
│   │   │   ├── subscriptions/
│   │   │   │   ├── page.tsx          # /subscriptions
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # /subscriptions/:id
│   │   │   ├── insights/
│   │   │   │   └── page.tsx          # /insights
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # /settings
│   │   │   ├── page.tsx              # / (首頁)
│   │   │   └── layout.tsx            # Dashboard 布局
│   │   │
│   │   ├── onboarding/
│   │   │   └── page.tsx              # /onboarding
│   │   │
│   │   ├── layout.tsx                # Root Layout
│   │   ├── globals.css               # 全局樣式
│   │   └── not-found.tsx             # 404 頁面
│   │
│   ├── features/                     # 功能模塊 (Feature-Sliced Design)
│   │   ├── expenses/
│   │   │   ├── components/
│   │   │   │   ├── ExpenseInput.tsx          # 快速記帳輸入
│   │   │   │   ├── ExpenseList.tsx           # 支出列表
│   │   │   │   ├── ExpenseItem.tsx           # 單個支出項
│   │   │   │   ├── ExpenseEditModal.tsx      # 編輯彈窗
│   │   │   │   ├── CategoryBadge.tsx         # 分類標籤
│   │   │   │   └── ConfidenceIndicator.tsx   # 信心度指示器
│   │   │   ├── hooks/
│   │   │   │   ├── useExpenses.ts            # 支出數據 Hook
│   │   │   │   ├── useParseExpense.ts        # 解析 Hook
│   │   │   │   └── useExpenseMutation.ts     # 增刪改 Hook
│   │   │   ├── api/
│   │   │   │   └── expenseApi.ts             # API 調用函數
│   │   │   ├── types/
│   │   │   │   └── expense.types.ts          # 類型定義
│   │   │   └── utils/
│   │   │       └── expenseUtils.ts           # 工具函數
│   │   │
│   │   ├── subscriptions/
│   │   │   ├── components/
│   │   │   │   ├── SubscriptionCard.tsx      # 訂閱卡片
│   │   │   │   ├── SubscriptionList.tsx      # 訂閱列表
│   │   │   │   ├── SubscriptionForm.tsx      # 新增/編輯表單
│   │   │   │   ├── BillingCalendar.tsx       # 扣款日曆
│   │   │   │   └── MonthlySummary.tsx        # 月度總額
│   │   │   ├── hooks/
│   │   │   │   ├── useSubscriptions.ts
│   │   │   │   ├── useSubscriptionMutation.ts
│   │   │   │   └── useNextBilling.ts
│   │   │   ├── api/
│   │   │   │   └── subscriptionApi.ts
│   │   │   ├── types/
│   │   │   │   └── subscription.types.ts
│   │   │   └── utils/
│   │   │       └── billingUtils.ts
│   │   │
│   │   ├── insights/
│   │   │   ├── components/
│   │   │   │   ├── MonthlyChart.tsx          # 月度圖表
│   │   │   │   ├── CategoryPieChart.tsx      # 分類圓餅圖
│   │   │   │   ├── TrendLineChart.tsx        # 趨勢折線圖
│   │   │   │   ├── InsightCard.tsx           # AI 洞察卡片
│   │   │   │   └── AnomalyAlert.tsx          # 異常提醒
│   │   │   ├── hooks/
│   │   │   │   ├── useMonthlyInsights.ts
│   │   │   │   └── useTrends.ts
│   │   │   ├── api/
│   │   │   │   └── insightsApi.ts
│   │   │   └── types/
│   │   │       └── insights.types.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── GoogleAuthButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSession.ts
│   │   │   ├── api/
│   │   │   │   └── authApi.ts
│   │   │   └── types/
│   │   │       └── auth.types.ts
│   │   │
│   │   ├── onboarding/
│   │   │   ├── components/
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── FeatureCarousel.tsx
│   │   │   │   ├── FirstExpenseGuide.tsx
│   │   │   │   └── CelebrationAnimation.tsx
│   │   │   └── hooks/
│   │   │       └── useOnboarding.ts
│   │   │
│   │   └── notifications/
│   │       ├── components/
│   │       │   ├── NotificationBell.tsx
│   │       │   ├── NotificationList.tsx
│   │       │   └── NotificationItem.tsx
│   │       ├── hooks/
│   │       │   └── useNotifications.ts
│   │       └── api/
│   │           └── notificationApi.ts
│   │
│   ├── widgets/                      # 組合組件 (跨功能複用)
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── NavMenu.tsx
│   │   │   └── QuickStats.tsx
│   │   ├── EmptyState/
│   │   │   └── EmptyState.tsx
│   │   └── ErrorBoundary/
│   │       └── ErrorBoundary.tsx
│   │
│   ├── components/                   # 基礎 UI 組件 (Atomic Design)
│   │   ├── ui/                       # shadcn/ui 組件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── forms/                    # 表單組件
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormDatePicker.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   └── FormError.tsx
│   │   │
│   │   ├── feedback/                 # 反饋組件
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingDots.tsx
│   │   │   ├── SuccessAnimation.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   │
│   │   └── layout/                   # 布局組件
│   │       ├── Container.tsx
│   │       ├── Grid.tsx
│   │       ├── Stack.tsx
│   │       └── Spacer.tsx
│   │
│   ├── shared/                       # 共享資源
│   │   ├── lib/                      # 工具庫
│   │   │   ├── api/
│   │   │   │   ├── client.ts         # API 客戶端
│   │   │   │   ├── interceptors.ts   # 攔截器
│   │   │   │   └── errorHandler.ts   # 錯誤處理
│   │   │   ├── utils/
│   │   │   │   ├── cn.ts             # className 工具
│   │   │   │   ├── date.ts           # 日期工具
│   │   │   │   ├── format.ts         # 格式化工具
│   │   │   │   ├── validators.ts     # 驗證器
│   │   │   │   └── storage.ts        # 本地存儲
│   │   │   └── hooks/
│   │   │       ├── useDebounce.ts
│   │   │       ├── useMediaQuery.ts
│   │   │       ├── useLocalStorage.ts
│   │   │       ├── useInfiniteScroll.ts
│   │   │       └── useKeyPress.ts
│   │   │
│   │   ├── store/                    # Zustand 全局狀態
│   │   │   ├── useAppStore.ts        # 應用狀態
│   │   │   ├── useAuthStore.ts       # 認證狀態
│   │   │   ├── useExpenseStore.ts    # 支出狀態
│   │   │   ├── useUIStore.ts         # UI 狀態 (主題、側邊欄)
│   │   │   └── useOfflineStore.ts    # 離線狀態
│   │   │
│   │   ├── types/                    # TypeScript 類型
│   │   │   ├── api.types.ts
│   │   │   ├── common.types.ts
│   │   │   ├── category.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/                # 常量
│   │   │   ├── categories.ts
│   │   │   ├── routes.ts
│   │   │   ├── config.ts
│   │   │   └── colors.ts
│   │   │
│   │   └── config/                   # 配置文件
│   │       ├── queryClient.ts        # React Query 配置
│   │       ├── apiConfig.ts          # API 配置
│   │       └── sentry.ts             # Sentry 配置
│   │
│   └── styles/                       # 樣式文件
│       ├── globals.css               # 全局樣式
│       ├── variables.css             # CSS 變量
│       └── animations.css            # 動畫樣式
│
├── public/                           # 靜態資源
│   ├── icons/
│   ├── images/
│   ├── manifest.json                 # PWA Manifest
│   └── sw.js                         # Service Worker
│
├── .storybook/                       # Storybook 配置
│   ├── main.ts
│   └── preview.ts
│
├── __tests__/                        # 測試文件
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── __mocks__/
│
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── vitest.config.ts
├── playwright.config.ts
└── README.md
```

---

## 5. 組件設計

### 5.1 Atomic Design 層次

```
Atoms (原子)
  └── Button, Input, Badge, Icon
       ↓
Molecules (分子)
  └── FormInput, SearchBar, CategoryBadge
       ↓
Organisms (組織)
  └── ExpenseInput, SubscriptionCard, Header
       ↓
Templates (模板)
  └── DashboardLayout, AuthLayout
       ↓
Pages (頁面)
  └── HomePage, ExpensesPage, SubscriptionsPage
```

### 5.2 核心組件實現

#### 5.2.1 ExpenseInput (快速記帳輸入)

```typescript
// src/features/expenses/components/ExpenseInput.tsx
'use client';

import { useState } from 'react';
import { useParseExpense } from '../hooks/useParseExpense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { SuccessAnimation } from '@/components/feedback/SuccessAnimation';

interface ExpenseInputProps {
  onSuccess?: () => void;
}

export function ExpenseInput({ onSuccess }: ExpenseInputProps) {
  const [input, setInput] = useState('');
  const { mutate: parseExpense, isPending, isSuccess } = useParseExpense();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    parseExpense(
      { text: input },
      {
        onSuccess: (data) => {
          setInput('');
          onSuccess?.();
        },
        onError: (error) => {
          // 錯誤提示已在 errorHandler 處理
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="試試看輸入「早餐 65」"
          className="h-14 text-lg"
          disabled={isPending}
        />
        {isPending && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!input.trim() || isPending}
      >
        {isPending ? '解析中...' : '確認'}
      </Button>

      {isSuccess && <SuccessAnimation />}
    </form>
  );
}
```

#### 5.2.2 ExpenseList (支出列表)

```typescript
// src/features/expenses/components/ExpenseList.tsx
'use client';

import { useExpenses } from '../hooks/useExpenses';
import { ExpenseItem } from './ExpenseItem';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { EmptyState } from '@/widgets/EmptyState';
import { useInfiniteScroll } from '@/shared/lib/hooks/useInfiniteScroll';

interface ExpenseListProps {
  month?: string;
  category?: string;
}

export function ExpenseList({ month, category }: ExpenseListProps) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExpenses({ month, category });

  const { ref } = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoading: isFetchingNextPage,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        載入失敗，請稍後再試
      </div>
    );
  }

  const expenses = data?.pages.flatMap((page) => page.expenses) ?? [];

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="還沒有記帳記錄"
        description="開始記第一筆帳吧！"
        icon="💰"
      />
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}

      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          {isFetchingNextPage && <LoadingSpinner size="sm" />}
        </div>
      )}
    </div>
  );
}
```

#### 5.2.3 SubscriptionCard (訂閱卡片)

```typescript
// src/features/subscriptions/components/SubscriptionCard.tsx
'use client';

import { Subscription } from '../types/subscription.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/shared/lib/utils/format';
import { cn } from '@/shared/lib/utils/cn';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: () => void;
  onCancel?: () => void;
}

export function SubscriptionCard({
  subscription,
  onEdit,
  onCancel,
}: SubscriptionCardProps) {
  const { name, amount, billing_cycle, next_billing_date, days_until_billing, status } =
    subscription;

  const isUpcoming = days_until_billing <= 3 && days_until_billing >= 0;

  return (
    <Card
      className={cn(
        'p-4 transition-all',
        isUpcoming && 'border-yellow-500 border-2',
        status === 'CANCELLED' && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatCurrency(amount)}
            <span className="text-sm text-muted-foreground ml-1">
              /{billing_cycle === 'MONTHLY' ? '月' : '年'}
            </span>
          </p>

          <div className="mt-3 space-y-1 text-sm">
            <p className="text-muted-foreground">
              下次扣款：{new Date(next_billing_date).toLocaleDateString('zh-TW')}
            </p>
            <p
              className={cn(
                'font-medium',
                isUpcoming ? 'text-yellow-600' : 'text-muted-foreground'
              )}
            >
              {days_until_billing === 0
                ? '今天扣款'
                : days_until_billing === 1
                ? '明天扣款'
                : `${days_until_billing} 天後扣款`}
            </p>
          </div>
        </div>

        <Badge
          variant={status === 'ACTIVE' ? 'default' : 'secondary'}
          className="ml-2"
        >
          {status === 'ACTIVE' ? '活躍' : status === 'PAUSED' ? '暫停' : '已取消'}
        </Badge>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
          編輯
        </Button>
        {status === 'ACTIVE' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex-1 text-destructive"
          >
            取消
          </Button>
        )}
      </div>
    </Card>
  );
}
```

#### 5.2.4 MonthlyChart (月度圖表)

```typescript
// src/features/insights/components/MonthlyChart.tsx
'use client';

import { useMemo } from 'use';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useMonthlyInsights } from '../hooks/useMonthlyInsights';
import { CATEGORY_COLORS } from '@/shared/constants/colors';
import { Card } from '@/components/ui/card';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MonthlyChartProps {
  month?: string;
}

export function MonthlyChart({ month }: MonthlyChartProps) {
  const { data, isLoading } = useMonthlyInsights(month);

  const chartData = useMemo(() => {
    if (!data?.category_breakdown) return null;

    return {
      labels: data.category_breakdown.map((item) => item.category),
      datasets: [
        {
          data: data.category_breakdown.map((item) => item.amount),
          backgroundColor: data.category_breakdown.map(
            (item) => CATEGORY_COLORS[item.category]
          ),
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-64 flex items-center justify-center">
          載入中...
        </div>
      </Card>
    );
  }

  if (!chartData) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">分類佔比</h3>
      <div className="h-64">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.parsed;
                    const percentage = (
                      (value / data.total_expense) *
                      100
                    ).toFixed(1);
                    return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </Card>
  );
}
```

---

## 6. 狀態管理

### 6.1 Zustand Store 設計

#### 6.1.1 認證狀態 (useAuthStore)

```typescript
// src/shared/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

#### 6.1.2 UI 狀態 (useUIStore)

```typescript
// src/shared/store/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  // 側邊欄
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // 主題
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // 通知
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  theme: 'system',
  setTheme: (theme) => set({ theme }),

  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
```

#### 6.1.3 離線狀態 (useOfflineStore)

```typescript
// src/shared/store/useOfflineStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PendingAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'EXPENSE' | 'SUBSCRIPTION';
  data: any;
  timestamp: number;
}

interface OfflineState {
  isOnline: boolean;
  pendingActions: PendingAction[];

  setOnline: (online: boolean) => void;
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp'>) => void;
  removePendingAction: (id: string) => void;
  clearPendingActions: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingActions: [],

      setOnline: (online) => set({ isOnline: online }),

      addPendingAction: (action) =>
        set((state) => ({
          pendingActions: [
            ...state.pendingActions,
            {
              ...action,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),

      removePendingAction: (id) =>
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => a.id !== id),
        })),

      clearPendingActions: () => set({ pendingActions: [] }),
    }),
    {
      name: 'offline-storage',
    }
  )
);
```

### 6.2 React Query 配置

```typescript
// src/shared/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 分鐘
      gcTime: 1000 * 60 * 30, // 30 分鐘 (原 cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query Keys
export const queryKeys = {
  expenses: {
    all: ['expenses'] as const,
    list: (filters?: any) => ['expenses', 'list', filters] as const,
    detail: (id: string) => ['expenses', 'detail', id] as const,
  },
  subscriptions: {
    all: ['subscriptions'] as const,
    list: (filters?: any) => ['subscriptions', 'list', filters] as const,
    detail: (id: string) => ['subscriptions', 'detail', id] as const,
    summary: () => ['subscriptions', 'summary'] as const,
  },
  insights: {
    monthly: (month?: string) => ['insights', 'monthly', month] as const,
    trends: (params?: any) => ['insights', 'trends', params] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: any) => ['notifications', 'list', filters] as const,
  },
};
```

---

## 7. 路由設計

### 7.1 路由結構

```
/                           # 首頁 (Dashboard)
├── /login                  # 登入頁
├── /register               # 註冊頁
├── /onboarding             # 用戶引導
│
├── /expenses               # 支出管理
│   └── /expenses/:id       # 支出詳情
│
├── /subscriptions          # 訂閱管理
│   └── /subscriptions/:id  # 訂閱詳情
│
├── /insights               # 智能分析
│
└── /settings               # 設定
    ├── /settings/profile   # 個人資料
    ├── /settings/security  # 安全設置
    └── /settings/notifications  # 通知設置
```

### 7.2 路由守衛

```typescript
// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { Header } from '@/widgets/Header';
import { Sidebar } from '@/widgets/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

## 8. UI 設計系統

### 8.1 色彩系統

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 品牌色
        primary: {
          DEFAULT: '#4A90E2',
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B9DDFF',
          300: '#7CC0FF',
          400: '#4A90E2',
          500: '#2C7AC8',
          600: '#1E5FA0',
          700: '#164978',
          800: '#0F3350',
          900: '#081D28',
        },
        // 語義色
        success: '#4CAF50',
        warning: '#FFA500',
        error: '#E74C3C',
        info: '#2196F3',
        // 分類色
        category: {
          food: '#FF6B6B',
          transport: '#4ECDC4',
          entertainment: '#FFD93D',
          shopping: '#95E1D3',
          housing: '#F38181',
          medical: '#AA96DA',
          education: '#FCBAD3',
          subscription: '#A8DADC',
          other: '#B4B4B4',
          income: '#6BCF7F',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'PingFang TC',
          'Microsoft JhengHei',
          'sans-serif',
        ],
        mono: ['SF Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        // 8px Grid
        '0.5': '0.125rem', // 2px
        '1': '0.25rem', // 4px
        '1.5': '0.375rem', // 6px
        '2': '0.5rem', // 8px
        '3': '0.75rem', // 12px
        '4': '1rem', // 16px
        '6': '1.5rem', // 24px
        '8': '2rem', // 32px
        '12': '3rem', // 48px
        '16': '4rem', // 64px
      },
      borderRadius: {
        sm: '0.5rem', // 8px
        DEFAULT: '0.75rem', // 12px
        lg: '1rem', // 16px
        xl: '1.5rem', // 24px
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 8.2 組件樣式規範

```typescript
// src/components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-600',
        destructive: 'bg-error text-white hover:bg-error/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

---

## 9. 性能優化

### 9.1 代碼分割

```typescript
// 動態導入大型組件
import dynamic from 'next/dynamic';

// 圖表組件延遲載入
const MonthlyChart = dynamic(
  () => import('@/features/insights/components/MonthlyChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false, // 不進行服務端渲染
  }
);

// Storybook 組件延遲載入
const Storybook = dynamic(() => import('./Storybook'), {
  ssr: false,
});
```

### 9.2 圖片優化

```typescript
// 使用 Next.js Image 組件
import Image from 'next/image';

export function UserAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className="rounded-full"
      loading="lazy"
      placeholder="blur"
      blurDataURL="/placeholder-avatar.jpg"
    />
  );
}
```

### 9.3 虛擬滾動

```typescript
// 使用 react-window 實現虛擬滾動
import { FixedSizeList } from 'react-window';

export function VirtualExpenseList({ expenses }: { expenses: Expense[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={expenses.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ExpenseItem expense={expenses[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

### 9.4 請求優化

```typescript
// 使用 React Query 的預取
export function useExpensesPrefetch(month?: string) {
  const queryClient = useQueryClient();

  const prefetchExpenses = async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.expenses.list({ month }),
      queryFn: () => expenseApi.getExpenses({ month }),
      staleTime: 1000 * 60 * 5, // 5 分鐘
    });
  };

  return { prefetchExpenses };
}

// 在鏈接 hover 時預取
export function ExpenseMonthLink({ month }: { month: string }) {
  const { prefetchExpenses } = useExpensesPrefetch(month);

  return (
    <Link
      href={`/expenses?month=${month}`}
      onMouseEnter={prefetchExpenses}
    >
      {month}
    </Link>
  );
}
```

---

## 10. 測試策略

### 10.1 單元測試 (Vitest)

```typescript
// src/features/expenses/__tests__/ExpenseInput.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExpenseInput } from '../components/ExpenseInput';

describe('ExpenseInput', () => {
  it('應正確渲染輸入框', () => {
    render(<ExpenseInput />);

    const input = screen.getByPlaceholderText('試試看輸入「早餐 65」');
    expect(input).toBeInTheDocument();
  });

  it('應在點擊確認後調用 parseExpense', async () => {
    const mockParse = vi.fn();

    render(<ExpenseInput onSuccess={mockParse} />);

    const input = screen.getByPlaceholderText('試試看輸入「早餐 65」');
    const button = screen.getByText('確認');

    await userEvent.type(input, '早餐 65');
    await userEvent.click(button);

    expect(mockParse).toHaveBeenCalledWith({ text: '早餐 65' });
  });

  it('應在輸入為空時禁用按鈕', () => {
    render(<ExpenseInput />);

    const button = screen.getByText('確認');
    expect(button).toBeDisabled();
  });
});
```

### 10.2 組件測試 (Testing Library)

```typescript
// src/features/subscriptions/__tests__/SubscriptionCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SubscriptionCard } from '../components/SubscriptionCard';

const mockSubscription = {
  id: '1',
  name: 'Netflix',
  amount: 390,
  billing_cycle: 'MONTHLY' as const,
  next_billing_date: '2025-02-15',
  days_until_billing: 3,
  status: 'ACTIVE' as const,
};

describe('SubscriptionCard', () => {
  it('應正確顯示訂閱信息', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('$390')).toBeInTheDocument();
    expect(screen.getByText('3 天後扣款')).toBeInTheDocument();
  });

  it('應在即將扣款時顯示黃色邊框', () => {
    render(<SubscriptionCard subscription={mockSubscription} />);

    const card = screen.getByText('Netflix').closest('div');
    expect(card).toHaveClass('border-yellow-500');
  });

  it('應在扣款當天顯示「今天扣款」', () => {
    const today = { ...mockSubscription, days_until_billing: 0 };

    render(<SubscriptionCard subscription={today} />);

    expect(screen.getByText('今天扣款')).toBeInTheDocument();
  });
});
```

### 10.3 E2E 測試 (Playwright)

```typescript
// __tests__/e2e/expense-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('支出管理流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登入
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/');
  });

  test('應成功創建支出記錄', async ({ page }) => {
    // 1. 輸入記帳資訊
    await page.fill('[placeholder*="早餐"]', '早餐 65');
    await page.click('button:has-text("確認")');

    // 2. 等待成功提示
    await expect(page.locator('.success-animation')).toBeVisible();

    // 3. 驗證列表中出現新記錄
    await expect(page.locator('text=早餐')).toBeVisible();
    await expect(page.locator('text=$65')).toBeVisible();
  });

  test('應在輸入錯誤時顯示提示', async ({ page }) => {
    // 1. 輸入缺少金額的文本
    await page.fill('[placeholder*="早餐"]', '早餐');
    await page.click('button:has-text("確認")');

    // 2. 驗證錯誤提示
    await expect(page.locator('text=忘記填金額了嗎')).toBeVisible();
  });

  test('應支持編輯支出記錄', async ({ page }) => {
    // 1. 點擊編輯按鈕
    await page.click('[data-testid="expense-item"]:first-child >> button:has-text("編輯")');

    // 2. 修改分類
    await page.selectOption('[name="category"]', 'TRANSPORT');
    await page.click('button:has-text("儲存")');

    // 3. 驗證更新成功
    await expect(page.locator('text=已更新！AI 會記住這個修正')).toBeVisible();
  });
});
```

### 10.4 Storybook 組件文檔

```typescript
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: '確認',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: '刪除',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: '取消',
  },
};

export const Loading: Story = {
  args: {
    children: '載入中...',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <PlusIcon className="mr-2 h-4 w-4" />
        新增
      </>
    ),
  },
};
```

---

## 附錄

### A. 開發環境設置

```bash
# 安裝依賴
npm install

# 開發服務器
npm run dev

# 構建
npm run build

# 預覽生產構建
npm run start

# 測試
npm run test
npm run test:watch
npm run test:e2e
npm run test:coverage

# Storybook
npm run storybook
npm run build-storybook

# 代碼檢查
npm run lint
npm run format
npm run type-check
```

### B. 環境變量

```bash
# .env.local

# API 端點
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# 功能開關
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### C. PWA 配置

```json
// public/manifest.json
{
  "name": "QuickSmart 智能記帳",
  "short_name": "QuickSmart",
  "description": "最適合懶人的智慧記帳工具",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4A90E2",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### D. 性能指標目標

| 指標 | 目標值 | 當前值 | 狀態 |
|------|--------|--------|------|
| First Contentful Paint (FCP) | < 1.5s | - | 待測量 |
| Largest Contentful Paint (LCP) | < 2.5s | - | 待測量 |
| Cumulative Layout Shift (CLS) | < 0.1 | - | 待測量 |
| First Input Delay (FID) | < 100ms | - | 待測量 |
| Time to Interactive (TTI) | < 3.5s | - | 待測量 |
| Lighthouse Score | ≥ 90 | - | 待測量 |

### E. 無障礙檢查清單

- [ ] 所有圖片都有 alt 屬性
- [ ] 表單輸入都有關聯的 label
- [ ] 色彩對比度 ≥ 4.5:1 (WCAG AA)
- [ ] 鍵盤可完整操作所有功能
- [ ] ARIA 標籤正確設置
- [ ] 焦點可見且順序合理
- [ ] 錯誤訊息清晰可讀
- [ ] 支持螢幕閱讀器

---

**文檔版本**: v1.0
**最後更新**: 2025-10-23
**維護團隊**: QuickSmart Frontend Team
