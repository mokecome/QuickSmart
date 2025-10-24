# QuickSmart 智慧記帳 - 錯誤處理標準

## 📋 目錄
- [錯誤處理原則](#錯誤處理原則)
- [錯誤分類系統](#錯誤分類系統)
- [用戶友善錯誤訊息](#用戶友善錯誤訊息)
- [前端錯誤處理](#前端錯誤處理)
- [後端錯誤處理](#後端錯誤處理)
- [錯誤日誌與監控](#錯誤日誌與監控)
- [錯誤復原策略](#錯誤復原策略)

---

## 🎯 錯誤處理原則

### 核心原則

1. **用戶優先**：錯誤訊息必須說人話，避免技術術語
2. **提供解決方案**：告訴用戶下一步該做什麼
3. **情感連結**：用溫暖的語氣緩解焦慮
4. **系統可靠**：錯誤發生時系統仍保持可用（降級模式）
5. **可追蹤**：所有錯誤記錄到監控系統（Sentry）

### 錯誤處理檢查清單

**設計錯誤訊息時，確認：**
- [ ] 避免技術術語（Error 500、API timeout、CORS）
- [ ] 提供具體的下一步行動（重試、重新整理、聯繫客服）
- [ ] 使用「你」稱呼用戶（而非「用戶」）
- [ ] 驚嘆號不超過 1 個（減少焦慮感）
- [ ] 視覺層級明確（Critical > Error > Warning > Info）

---

## 🗂️ 錯誤分類系統

### 錯誤代碼規範

**格式：`CATEGORY_SPECIFIC_ERROR`**

```typescript
// src/constants/errorCodes.ts
export const ERROR_CODES = {
  // ========== 認證與授權 ==========
  UNAUTHORIZED: 'UNAUTHORIZED',                    // 未登入
  SESSION_EXPIRED: 'SESSION_EXPIRED',              // Session 過期
  FORBIDDEN: 'FORBIDDEN',                          // 無權限
  INVALID_TOKEN: 'INVALID_TOKEN',                  // Token 無效

  // ========== 輸入驗證 ==========
  INVALID_AMOUNT: 'INVALID_AMOUNT',                // 金額無效
  MISSING_AMOUNT: 'MISSING_AMOUNT',                // 缺少金額
  INVALID_DATE: 'INVALID_DATE',                    // 日期格式錯誤
  INVALID_CATEGORY: 'INVALID_CATEGORY',            // 分類無效
  INVALID_INPUT: 'INVALID_INPUT',                  // 輸入格式錯誤

  // ========== AI 服務 ==========
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',  // AI 服務失效
  AI_RATE_LIMIT_EXCEEDED: 'AI_RATE_LIMIT_EXCEEDED',  // AI 速率限制
  AI_PARSE_LOW_CONFIDENCE: 'AI_PARSE_LOW_CONFIDENCE', // AI 信心度低
  AI_TIMEOUT: 'AI_TIMEOUT',                          // AI 超時

  // ========== 資料操作 ==========
  NOT_FOUND: 'NOT_FOUND',                          // 資源不存在
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',              // 重複資料
  SYNC_CONFLICT: 'SYNC_CONFLICT',                  // 同步衝突
  VERSION_MISMATCH: 'VERSION_MISMATCH',            // 版本不符

  // ========== 網路與系統 ==========
  NETWORK_ERROR: 'NETWORK_ERROR',                  // 網路錯誤
  OFFLINE_MODE: 'OFFLINE_MODE',                    // 離線模式
  DATABASE_ERROR: 'DATABASE_ERROR',                // 資料庫錯誤
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',                  // 未知錯誤
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

### 錯誤嚴重性分級

```typescript
export enum ErrorSeverity {
  CRITICAL = 'critical',  // 阻斷操作，需立即處理
  ERROR = 'error',        // 操作失敗，但系統可用
  WARNING = 'warning',    // 可繼續但需注意
  INFO = 'info',          // 提示訊息
}

// 錯誤嚴重性對應表
export const ERROR_SEVERITY_MAP: Record<ErrorCode, ErrorSeverity> = {
  // Critical - 阻斷操作
  UNAUTHORIZED: ErrorSeverity.CRITICAL,
  SESSION_EXPIRED: ErrorSeverity.CRITICAL,
  DATABASE_ERROR: ErrorSeverity.CRITICAL,

  // Error - 操作失敗
  INVALID_AMOUNT: ErrorSeverity.ERROR,
  MISSING_AMOUNT: ErrorSeverity.ERROR,
  NOT_FOUND: ErrorSeverity.ERROR,
  NETWORK_ERROR: ErrorSeverity.ERROR,

  // Warning - 可繼續但需注意
  AI_PARSE_LOW_CONFIDENCE: ErrorSeverity.WARNING,
  SYNC_CONFLICT: ErrorSeverity.WARNING,
  AI_RATE_LIMIT_EXCEEDED: ErrorSeverity.WARNING,

  // Info - 提示訊息
  OFFLINE_MODE: ErrorSeverity.INFO,
  AI_SERVICE_UNAVAILABLE: ErrorSeverity.INFO,  // 已啟用降級模式
};
```

---

## 💬 用戶友善錯誤訊息

### 標準訊息模板

```typescript
// src/constants/errorMessages.ts
export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessage> = {
  // ========== AI 服務相關 ==========
  AI_SERVICE_UNAVAILABLE: {
    title: 'AI 小幫手暫時休息中',
    message: '別擔心，我們已切換到基本模式。你仍可記帳，只需手動選擇分類 😊',
    hint: '通常 1-2 分鐘就會恢復',
    action: '知道了',
    severity: 'info',
    icon: '🤖',
    fallbackMode: true,
  },

  AI_RATE_LIMIT_EXCEEDED: {
    title: '今天記帳次數已達上限',
    message: '你今天已經記帳 20 次了！真的很棒 👍\n明天 00:00 後就能繼續使用 AI 功能',
    hint: '目前仍可手動選擇分類記帳',
    action: '手動記帳',
    severity: 'warning',
    icon: '⏱️',
  },

  AI_PARSE_LOW_CONFIDENCE: {
    title: 'AI 不太確定這筆記帳',
    message: '要不要確認一下分類是否正確？',
    hint: 'AI 信心度：{confidence}%（建議 > 80%）',
    action: '檢查分類',
    severity: 'warning',
    icon: '🤔',
  },

  AI_TIMEOUT: {
    title: 'AI 回應時間較長',
    message: '我們正在努力處理中，請稍候...',
    hint: '若超過 10 秒，將自動切換到手動模式',
    action: '等待中',
    severity: 'warning',
    icon: '⏳',
  },

  // ========== 輸入驗證 ==========
  INVALID_AMOUNT: {
    title: '金額好像怪怪的',
    message: '金額必須大於 0 喔！試試看「早餐 65」',
    action: '重新輸入',
    severity: 'error',
    icon: '💰',
  },

  MISSING_AMOUNT: {
    title: '忘記填金額了嗎？',
    message: '試試看這樣輸入：「午餐 120」或「星巴克 150」',
    hint: '格式：描述 + 空格 + 金額',
    action: '重新輸入',
    severity: 'error',
    icon: '✏️',
  },

  INVALID_DATE: {
    title: '日期格式不正確',
    message: '支援的格式：「今天」、「昨天」、「2025-01-15」',
    action: '重新輸入',
    severity: 'error',
    icon: '📅',
  },

  INVALID_CATEGORY: {
    title: '分類不存在',
    message: '請從以下分類選擇：餐飲、交通、娛樂、購物...',
    action: '選擇分類',
    severity: 'error',
    icon: '🏷️',
  },

  // ========== 同步與網路 ==========
  SYNC_CONFLICT: {
    title: '資料已在其他裝置更新',
    message: '你的手機剛才修改了這筆記帳，要重新載入最新資料嗎？',
    action: '重新載入',
    secondaryAction: '保留目前版本',
    severity: 'warning',
    icon: '🔄',
  },

  NETWORK_ERROR: {
    title: '網路似乎不太穩定',
    message: '請檢查網路連線後重試',
    hint: '資料已暫存，連線恢復後會自動同步',
    action: '重試',
    severity: 'error',
    icon: '📡',
  },

  OFFLINE_MODE: {
    title: '目前處於離線模式',
    message: '別擔心，記帳資料會存在本地，等網路恢復後自動上傳',
    action: '知道了',
    severity: 'info',
    icon: '✈️',
  },

  // ========== 認證與授權 ==========
  UNAUTHORIZED: {
    title: '請先登入',
    message: '需要登入才能使用記帳功能',
    action: '前往登入',
    severity: 'critical',
    icon: '🔒',
  },

  SESSION_EXPIRED: {
    title: '登入已過期',
    message: '你已經 30 天沒有登入了，請重新驗證身份',
    action: '重新登入',
    severity: 'critical',
    icon: '⏰',
  },

  FORBIDDEN: {
    title: '無權存取',
    message: '你沒有權限存取此資源',
    action: '返回',
    severity: 'error',
    icon: '🚫',
  },

  // ========== 資料操作 ==========
  NOT_FOUND: {
    title: '找不到記錄',
    message: '這筆記帳可能已被刪除',
    action: '返回列表',
    severity: 'error',
    icon: '🔍',
  },

  DUPLICATE_ENTRY: {
    title: '記錄重複',
    message: '這筆記帳已經存在了',
    action: '查看記錄',
    severity: 'warning',
    icon: '⚠️',
  },

  // ========== 系統錯誤 ==========
  DATABASE_ERROR: {
    title: '糟糕！資料庫出了點問題',
    message: '我們正在緊急處理，請稍後再試',
    hint: '如果問題持續，請聯繫客服',
    action: '重試',
    severity: 'critical',
    icon: '🚨',
  },

  UNKNOWN_ERROR: {
    title: '發生了一點小問題',
    message: '請稍後再試，或聯繫客服',
    hint: '錯誤代碼：{errorCode}',
    action: '回報問題',
    severity: 'error',
    icon: '❌',
  },
};

// 錯誤訊息類型定義
export interface ErrorMessage {
  title: string;
  message: string;
  hint?: string;
  action: string;
  secondaryAction?: string;
  severity: ErrorSeverity;
  icon: string;
  fallbackMode?: boolean;  // 是否已啟用降級模式
}
```

### 視覺設計配置

```typescript
// src/constants/errorStyles.ts
export const ERROR_SEVERITY_CONFIG = {
  critical: {
    backgroundColor: '#FEE2E2',  // 紅色背景
    textColor: '#991B1B',         // 深紅文字
    borderColor: '#F87171',       // 紅色邊框
    displayMode: 'modal',         // 全螢幕 Modal
    autoDismiss: false,           // 不自動消失
    blockInteraction: true,       // 阻斷其他操作
  },
  error: {
    backgroundColor: '#FEF3C7',  // 黃色背景
    textColor: '#92400E',         // 深黃文字
    borderColor: '#FCD34D',       // 黃色邊框
    displayMode: 'toast',
    autoDismiss: false,
    blockInteraction: false,
  },
  warning: {
    backgroundColor: '#DBEAFE',  // 藍色背景
    textColor: '#1E40AF',         // 深藍文字
    borderColor: '#93C5FD',       // 藍色邊框
    displayMode: 'toast',
    autoDismiss: 5000,           // 5 秒後消失
    blockInteraction: false,
  },
  info: {
    backgroundColor: '#E0E7FF',  // 淡紫背景
    textColor: '#3730A3',         // 深紫文字
    borderColor: '#A5B4FC',       // 紫色邊框
    displayMode: 'toast',
    autoDismiss: 3000,           // 3 秒後消失
    blockInteraction: false,
  },
};
```

---

## 🎨 前端錯誤處理

### React Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 記錄到 Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center">
              <span className="text-6xl">😵</span>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                糟糕！出現了一點問題
              </h1>
              <p className="mt-2 text-gray-600">
                我們已經記錄此錯誤，團隊會盡快修復
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  重新整理頁面
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  返回首頁
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 錯誤 Toast 組件

```typescript
// src/components/ErrorToast.tsx
'use client';

import { useEffect } from 'react';
import { ERROR_MESSAGES, ERROR_SEVERITY_CONFIG } from '@/constants/errorMessages';
import type { ErrorCode } from '@/types/errors';

interface Props {
  error: AppError;
  onClose: () => void;
}

export function ErrorToast({ error, onClose }: Props) {
  const config = ERROR_MESSAGES[error.code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  const severityConfig = ERROR_SEVERITY_CONFIG[config.severity];

  // 自動消失
  useEffect(() => {
    if (severityConfig.autoDismiss) {
      const timer = setTimeout(onClose, severityConfig.autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [severityConfig.autoDismiss, onClose]);

  return (
    <div
      className="fixed top-4 right-4 max-w-md w-full shadow-lg rounded-lg p-4 z-50"
      style={{
        backgroundColor: severityConfig.backgroundColor,
        color: severityConfig.textColor,
        borderLeft: `4px solid ${severityConfig.borderColor}`,
      }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold">{config.title}</h3>
          <p className="mt-1 text-sm">
            {config.message.replace('{confidence}', error.metadata?.confidence?.toString() || '')}
          </p>
          {config.hint && (
            <p className="mt-2 text-xs opacity-75">
              {config.hint.replace('{errorCode}', error.code)}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-lg opacity-50 hover:opacity-100"
          aria-label="關閉"
        >
          ×
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={error.retry || onClose}
          className="px-4 py-2 rounded text-sm font-medium"
          style={{
            backgroundColor: severityConfig.textColor,
            color: severityConfig.backgroundColor,
          }}
        >
          {config.action}
        </button>
        {config.secondaryAction && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium opacity-70 hover:opacity-100"
          >
            {config.secondaryAction}
          </button>
        )}
      </div>
    </div>
  );
}
```

### 自訂錯誤類別

```typescript
// src/types/errors.ts
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public metadata?: Record<string, any>,
    public retry?: () => void
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 使用範例
throw new AppError(
  'INVALID_AMOUNT',
  '金額必須大於 0',
  { amount: 0 },
  () => window.location.reload()  // 重試函數
);
```

### React Query 錯誤處理

```typescript
// src/hooks/useExpenses.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppError } from '@/types/errors';

export function useCreateExpense() {
  return useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(
          errorData.error.code,
          errorData.error.message,
          errorData.error
        );
      }

      return response.json();
    },

    onError: (error: AppError) => {
      // 顯示錯誤 Toast
      toast.error(<ErrorToast error={error} />);

      // 特定錯誤處理
      if (error.code === 'AI_RATE_LIMIT_EXCEEDED') {
        // 切換到手動模式
        setManualMode(true);
      }
    },
  });
}
```

---

## ⚙️ 後端錯誤處理

### API Route 錯誤處理

```typescript
// app/api/expenses/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as Sentry from '@sentry/nextjs';
import { AppError } from '@/types/errors';
import { InvalidAmountError, RateLimitError } from '@/domain/errors';

export async function POST(req: Request) {
  try {
    // 1. 認證檢查
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: '請先登入' } },
        { status: 401 }
      );
    }

    // 2. 解析請求
    const body = await req.json();

    // 3. 驗證輸入
    if (!body.text) {
      return NextResponse.json(
        { error: { code: 'MISSING_AMOUNT', message: '請輸入記帳內容' } },
        { status: 400 }
      );
    }

    // 4. 業務邏輯
    const expense = await createExpense(session.user.id, body.text);

    return NextResponse.json({ data: expense }, { status: 201 });

  } catch (error) {
    // 已知錯誤處理
    if (error instanceof InvalidAmountError) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_AMOUNT',
            message: error.message,
            field: 'amount',
          }
        },
        { status: 400 }
      );
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        {
          error: {
            code: 'AI_RATE_LIMIT_EXCEEDED',
            message: error.message,
            retryAfter: error.retryAfter,
          }
        },
        { status: 429, headers: { 'Retry-After': error.retryAfter } }
      );
    }

    // 未知錯誤 - 記錄到 Sentry
    console.error('[API Error]', error);
    Sentry.captureException(error, {
      tags: {
        api_route: '/api/expenses',
        method: 'POST',
      },
      user: { id: session?.user?.id },
    });

    return NextResponse.json(
      {
        error: {
          code: 'UNKNOWN_ERROR',
          message: '發生未預期的錯誤，請稍後再試',
        }
      },
      { status: 500 }
    );
  }
}
```

### 領域層錯誤

```typescript
// src/domain/errors/index.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidAmountError extends DomainError {
  constructor(amount: number) {
    super(`金額必須大於 0，但收到 ${amount}`);
  }
}

export class RateLimitError extends DomainError {
  constructor(public retryAfter: string) {
    super(`速率限制，請於 ${retryAfter} 後重試`);
  }
}

export class SyncConflictError extends DomainError {
  constructor(
    public serverVersion: number,
    public clientVersion: number
  ) {
    super(`資料衝突：伺服器版本 ${serverVersion}，客戶端版本 ${clientVersion}`);
  }
}
```

---

## 📊 錯誤日誌與監控

### Sentry 整合

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENV || 'development',

  // 採樣率
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 錯誤過濾
  beforeSend(event, hint) {
    const error = hint.originalException;

    // 過濾不重要的錯誤
    if (error instanceof Error) {
      // ChunkLoadError（Webpack 動態載入失敗，通常是網路問題）
      if (error.name === 'ChunkLoadError') {
        return null;
      }

      // 取消的請求
      if (error.message.includes('AbortError')) {
        return null;
      }
    }

    // 過濾 401/403（正常的認證失敗）
    if (event.exception?.values?.[0]?.type === 'UnauthorizedError') {
      return null;
    }

    return event;
  },

  // 添加上下文
  beforeBreadcrumb(breadcrumb, hint) {
    // 移除敏感資訊
    if (breadcrumb.category === 'console') {
      delete breadcrumb.data?.arguments;
    }
    return breadcrumb;
  },
});
```

### 錯誤記錄最佳實踐

```typescript
// src/utils/logger.ts
import * as Sentry from '@sentry/nextjs';

export class Logger {
  static error(message: string, error: Error, context?: Record<string, any>) {
    // 1. Console 輸出（開發環境）
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error, context);
    }

    // 2. Sentry 記錄（所有環境）
    Sentry.captureException(error, {
      tags: {
        category: 'application_error',
      },
      contexts: {
        custom: context,
      },
      level: 'error',
    });
  }

  static warn(message: string, context?: Record<string, any>) {
    console.warn(message, context);

    Sentry.captureMessage(message, {
      level: 'warning',
      contexts: { custom: context },
    });
  }

  static info(message: string, context?: Record<string, any>) {
    console.log(message, context);

    // Info 等級不記錄到 Sentry（節省配額）
  }
}

// 使用範例
try {
  await createExpense(data);
} catch (error) {
  Logger.error('Failed to create expense', error as Error, {
    userId: session.user.id,
    input: data,
  });
}
```

---

## 🔄 錯誤復原策略

### 自動重試機制

```typescript
// src/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: 'linear' | 'exponential';
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = 'exponential' } = options;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // 最後一次重試失敗，拋出錯誤
      if (i === maxRetries - 1) {
        throw error;
      }

      // 計算延遲時間
      const waitTime = backoff === 'exponential'
        ? delay * Math.pow(2, i)  // 1s, 2s, 4s, 8s...
        : delay * (i + 1);         // 1s, 2s, 3s, 4s...

      // 等待後重試
      await sleep(waitTime);
    }
  }

  throw new Error('Unreachable');
}

// 使用範例
const expense = await withRetry(
  () => claudeAPI.parse(input),
  { maxRetries: 3, backoff: 'exponential' }
);
```

### 降級策略（Fallback）

```typescript
// src/services/ExpenseParserOrchestrator.ts
export class ExpenseParserOrchestrator {
  constructor(
    private claudeAPI: ClaudeAPIClient,
    private fallbackParser: FallbackParser
  ) {}

  async parse(input: string): Promise<ParsedExpense> {
    try {
      // 優先使用 Claude API
      return await this.claudeAPI.parse(input);
    } catch (error) {
      if (
        error instanceof RateLimitError ||
        error instanceof ServiceUnavailableError
      ) {
        // 降級到規則引擎
        console.warn('[Fallback] Using rule-based parser', error);

        const result = await this.fallbackParser.parse(input);

        // 標記使用降級模式
        return {
          ...result,
          fallbackUsed: true,
          confidence: Math.min(result.confidence, 70),  // 降低信心度
        };
      }

      throw error;
    }
  }
}
```

### 斷路器模式（Circuit Breaker）

```typescript
// src/utils/circuitBreaker.ts
export class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime?: number;

  constructor(
    private threshold = 5,      // 失敗 5 次後開啟
    private timeout = 60000     // 60 秒後嘗試恢復
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 開路狀態：拒絕請求
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime! > this.timeout) {
        this.state = 'HALF_OPEN';  // 嘗試恢復
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      // 成功 → 重置
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
      }
      this.failureCount = 0;

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      // 失敗次數達到閾值 → 開路
      if (this.failureCount >= this.threshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }
}

// 使用範例
const claudeCircuitBreaker = new CircuitBreaker(5, 60000);

async function parseWithCircuitBreaker(input: string) {
  try {
    return await claudeCircuitBreaker.execute(
      () => claudeAPI.parse(input)
    );
  } catch (error) {
    // Circuit Breaker 開啟 → 使用降級模式
    return fallbackParser.parse(input);
  }
}
```

---

## 📋 錯誤處理檢查清單

### 開發階段

- [ ] 所有公開 API 都有錯誤處理
- [ ] 錯誤訊息避免技術術語
- [ ] 提供明確的下一步行動
- [ ] 錯誤分類使用統一的 ErrorCode
- [ ] 敏感資訊不記錄到日誌（密碼、Token）

### 測試階段

- [ ] 測試所有錯誤情境（網路失敗、API 超時、驗證錯誤）
- [ ] 驗證錯誤訊息對用戶友善
- [ ] 測試降級模式正常運作
- [ ] 驗證 Sentry 正確記錄錯誤

### 上線前

- [ ] Sentry 告警設定完成
- [ ] 錯誤率監控儀表板建立
- [ ] 緊急聯絡人名單更新
- [ ] 錯誤復原 SOP 文件完成

---

**文件版本：v1.0**
**最後更新：2025-10-20**
**維護者：技術團隊**
