# QuickSmart 智慧記帳 - 開發規範

## 📋 目錄
- [開發環境設定](#開發環境設定)
- [Git Workflow](#git-workflow)
- [程式碼風格](#程式碼風格)
- [測試規範](#測試規範)
- [Pull Request 流程](#pull-request-流程)
- [開發最佳實踐](#開發最佳實踐)

---

## 💻 開發環境設定

### 必備工具

**系統需求：**
- Node.js ≥ 20.x
- npm ≥ 10.x
- Git ≥ 2.40
- Docker Desktop（用於本地資料庫）

**推薦 IDE：**
- VS Code + 必裝擴充套件：
  - ESLint
  - Prettier
  - Prisma
  - Vitest
  - GitLens

### 專案初始化

```bash
# 1. Clone 專案
git clone https://github.com/your-org/quicksmart.git
cd quicksmart

# 2. 安裝依賴
npm install

# 3. 複製環境變數範本
cp .env.example .env.local

# 4. 啟動本地資料庫（Docker）
docker-compose up -d

# 5. 執行資料庫遷移
npm run db:migrate

# 6. 啟動開發伺服器
npm run dev
```

### 環境變數設定

**`.env.local` 範例：**
```bash
# 資料庫
DATABASE_URL="postgresql://user:password@localhost:5432/quicksmart"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # 生成方式: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Claude AI
CLAUDE_API_KEY="sk-ant-xxxxx"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_TOKEN="your-token"

# Encryption (資料加密)
ENCRYPTION_KEY="your-32-byte-hex-key"  # 生成方式: openssl rand -hex 32

# Sentry (錯誤追蹤)
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
```

**取得 API Keys：**
1. **Claude API**: https://console.anthropic.com/
2. **Google OAuth**: https://console.cloud.google.com/
3. **Upstash Redis**: https://console.upstash.com/
4. **Sentry**: https://sentry.io/

---

## 🌿 Git Workflow

### Branch 策略

我們使用 **GitHub Flow**（簡化版 Git Flow）：

```
main (受保護)
  ├── feature/add-expense-input       # 新功能
  ├── fix/ai-parsing-error            # Bug 修復
  ├── refactor/repository-pattern     # 重構
  ├── test/e2e-onboarding            # 測試增強
  └── docs/update-api-guide          # 文件更新
```

### Branch 命名規則

**格式：`<type>/<short-description>`**

**Type 類型：**
- `feature/` - 新功能開發
- `fix/` - Bug 修復
- `refactor/` - 重構（不改變功能）
- `test/` - 測試相關
- `docs/` - 文件更新
- `chore/` - 雜項（依賴更新、配置調整）
- `perf/` - 效能優化

**範例：**
```bash
✅ feature/telegram-integration
✅ fix/sync-conflict-handling
✅ refactor/expense-parser
✅ test/ai-accuracy-improvement
✅ docs/deployment-guide

❌ my-branch                    # 太模糊
❌ feature-telegram            # 缺少斜線
❌ Fix_Bug                     # 大小寫錯誤
```

### Commit Message 規範

**使用 Conventional Commits：**

**格式：**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 類型：**
- `feat` - 新功能
- `fix` - Bug 修復
- `refactor` - 重構
- `test` - 測試
- `docs` - 文件
- `style` - 格式調整（不影響代碼邏輯）
- `perf` - 效能優化
- `chore` - 雜項

**Scope（可選）：**
- `expense` - 支出相關
- `subscription` - 訂閱相關
- `auth` - 認證相關
- `ai` - AI 解析相關
- `api` - API 相關
- `ui` - UI 相關

**範例：**

```bash
# ✅ 良好範例
feat(expense): add AI parsing with Claude API

- Integrate Claude SDK
- Add fallback rule engine
- Test coverage: 95%

Refs: #123

# ✅ 簡短範例（小改動）
fix(api): handle rate limit error correctly

# ✅ Breaking Change
feat(auth)!: migrate to NextAuth.js v5

BREAKING CHANGE: Session structure changed, users need to re-login

# ❌ 不良範例
update code                    # 太模糊
Fixed bug                      # 沒有 scope
Add feature                    # 沒有具體說明
```

### Commit 頻率建議

**遵循 "小步快跑" 原則：**

```bash
# ✅ 每完成一個小功能就 commit
git add src/application/use-cases/parseExpense.ts
git commit -m "feat(expense): add parseExpense use case"

git add __tests__/unit/parseExpense.spec.ts
git commit -m "test(expense): add unit tests for parseExpense"

# ❌ 避免一次 commit 太多
git add .
git commit -m "完成所有功能"  # 包含 20 個檔案
```

---

## 🎨 程式碼風格

### TypeScript 規範

#### 基本規則

**使用 ESLint + Prettier：**

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    // 禁止 console.log（生產環境）
    "no-console": ["warn", { "allow": ["warn", "error"] }],

    // 變數必須使用 const/let（禁止 var）
    "prefer-const": "error",
    "no-var": "error",

    // 未使用的變數報錯
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "argsIgnorePattern": "^_" }
    ],

    // 禁止 any（除非明確標註）
    "@typescript-eslint/no-explicit-any": "warn",

    // 函數必須明確返回類型
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      { "allowExpressions": true }
    ]
  }
}
```

```json
// .prettierrc
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### 命名規範

```typescript
// ✅ 良好範例

// 介面與類型：PascalCase
interface ParsedExpense {
  amount: number;
  category: Category;
}

type Category = 'FOOD' | 'TRANSPORT' | 'ENTERTAINMENT';

// 類別：PascalCase
class ExpenseParser {
  private apiClient: ClaudeAPIClient;
}

// 函數與變數：camelCase
function parseExpense(input: string): Promise<ParsedExpense> {
  const userId = getCurrentUserId();
  return apiClient.parse(input);
}

// 常數：UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.anthropic.com';

// 私有屬性：前綴底線（可選）
class Service {
  private _cache: Map<string, any>;  // 或 private cache
}

// 檔案名稱：camelCase（函數/變數）或 PascalCase（類別/組件）
parseExpense.ts           // 函數
ExpenseParser.ts          // 類別
ExpenseInput.tsx          // React 組件
```

#### 型別定義

```typescript
// ✅ 明確型別
function createExpense(data: CreateExpenseDTO): Promise<Expense> {
  // ...
}

// ❌ 避免隱式 any
function createExpense(data) {  // ❌ 'data' 隱式為 any
  // ...
}

// ✅ 使用 interface 定義物件
interface CreateExpenseDTO {
  text: string;
  userId: string;
}

// ✅ 使用 type 定義聯合型別
type Category = 'FOOD' | 'TRANSPORT' | 'ENTERTAINMENT';

// ✅ 使用泛型
function findById<T>(id: string): Promise<T | null> {
  // ...
}
```

### 檔案與資料夾結構

**遵循 PRD 定義的專案結構：**

```
src/
├── domain/                    # 領域層（業務邏輯）
│   ├── entities/             # 實體
│   │   ├── Expense.ts
│   │   └── Subscription.ts
│   ├── value-objects/        # 值對象
│   │   ├── Money.ts
│   │   └── Category.ts
│   └── repositories/         # 倉儲介面
│       └── IExpenseRepository.ts
│
├── application/              # 應用層（用例）
│   ├── use-cases/
│   │   ├── parseExpense.ts
│   │   └── createExpense.ts
│   └── services/
│       └── AIParserService.ts
│
├── infrastructure/           # 基礎設施層
│   ├── ai/
│   │   └── ClaudeAPIClient.ts
│   ├── database/
│   │   └── repositories/
│   │       └── ExpenseRepository.ts
│   └── encryption/
│       └── FieldEncryption.ts
│
├── presentation/             # 展示層（Next.js）
│   ├── app/                  # App Router
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   └── api/
│   └── components/
│       ├── ExpenseInput.tsx
│       └── SubscriptionCard.tsx
│
└── __tests__/                # 測試
    ├── unit/
    ├── integration/
    └── e2e/
```

### Import 順序

```typescript
// 1. React / Next.js
import { useState } from 'react';
import { NextResponse } from 'next/server';

// 2. 第三方套件
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

// 3. 專案內部 - 絕對路徑（使用 @ alias）
import { ExpenseParser } from '@/application/services/ExpenseParser';
import { IExpenseRepository } from '@/domain/repositories/IExpenseRepository';

// 4. 型別
import type { Expense } from '@/domain/entities/Expense';

// 5. 相對路徑（同層級）
import { helper } from './helper';

// 6. CSS / 樣式
import styles from './styles.module.css';
```

**配置 Path Alias：**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/domain/*": ["./src/domain/*"],
      "@/application/*": ["./src/application/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"],
      "@/presentation/*": ["./src/presentation/*"]
    }
  }
}
```

### 註解規範

```typescript
// ✅ 使用 JSDoc 註解公開 API
/**
 * 解析自然語言記帳輸入
 * @param input - 用戶輸入，例如 "早餐 65"
 * @returns 解析後的支出記錄
 * @throws {InvalidAmountError} 當金額 <= 0
 * @example
 * const result = await parseExpense("早餐 65");
 * // { amount: 65, category: "FOOD", description: "早餐" }
 */
export async function parseExpense(input: string): Promise<ParsedExpense> {
  // ...
}

// ✅ 複雜邏輯加註解
function calculateNextBilling(subscription: Subscription): Date {
  // 處理閏年的特殊情況
  if (isLeapYear(year) && month === 2 && day === 29) {
    return new Date(year + 1, 1, 28);  // 下一年 2/28
  }

  return new Date(year, month, day);
}

// ❌ 避免無意義的註解
const userId = getUserId();  // 獲取用戶 ID  ← 多餘
```

---

## 🧪 測試規範

### 測試策略（遵循 PRD）

**測試金字塔：**
```
      E2E (3 個場景)          ← BDD（少而精）
     /               \
  Integration (15 個)         ← SDD（適中）
    /                   \
   Unit (50+ 個)               ← TDD + SDD（多而快）
```

### Unit Tests

**使用 Vitest + TDD/SDD：**

```typescript
// __tests__/unit/parseExpense.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { parseExpense } from '@/application/use-cases/parseExpense';

describe('parseExpense - Specification by Example', () => {
  // SDD: 用範例驅動開發
  const examples = [
    { input: '早餐 65', expected: { category: 'FOOD', amount: 65 } },
    { input: 'Netflix 390', expected: { category: 'SUBSCRIPTION', amount: 390 } },
    { input: 'Uber 120', expected: { category: 'TRANSPORT', amount: 120 } },
  ];

  // 使用 .each 批次測試
  it.each(examples)('應該正確解析 "$input"', async ({ input, expected }) => {
    const result = await parseExpense(input);
    expect(result).toMatchObject(expected);
  });

  // 邊界案例
  it('應該拋出錯誤當金額為 0', async () => {
    await expect(parseExpense('早餐 0')).rejects.toThrow('INVALID_AMOUNT');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/api/expenses.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer } from '@/test-utils/server';

describe('POST /api/expenses', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it('應該創建支出記錄', async () => {
    const response = await server.post('/api/expenses', {
      text: '早餐 65'
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      category: 'FOOD',
      amount: 65
    });
  });

  it('應該拒絕無效金額', async () => {
    const response = await server.post('/api/expenses', {
      text: '早餐 0'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_AMOUNT');
  });
});
```

### E2E Tests

```gherkin
# __tests__/e2e/features/expense-tracking.feature
Feature: 核心記帳流程

Scenario: 新用戶首次記帳（Aha Moment）
  Given 我打開 QuickSmart 首頁
  When 我完成 Google 登入
  And 我在輸入框輸入 "早餐 65"
  And 我點擊「確認」按鈕
  Then 我應該在 1 秒內看到成功訊息
  And 我應該看到彈出提示：「✨ 看！不用選分類，AI 都懂」
```

### 測試覆蓋率要求

**目標：**
- Unit Tests: ≥ 85%
- Integration Tests: ≥ 70%
- E2E Tests: 3 個核心場景

**檢查覆蓋率：**
```bash
npm run test:coverage

# 輸出範例：
# ----------------------------|---------|----------|---------|---------|
# File                        | % Stmts | % Branch | % Funcs | % Lines |
# ----------------------------|---------|----------|---------|---------|
# All files                   |   87.5  |   82.3   |   90.1  |   87.8  |
#  parseExpense.ts            |   95.2  |   88.9   |   100   |   95.0  |
#  CategoryClassifier.ts      |   82.1  |   75.0   |   85.7  |   82.5  |
# ----------------------------|---------|----------|---------|---------|
```

### 測試指令

```bash
# 單元測試（快速）
npm run test:unit

# 整合測試
npm run test:integration

# E2E 測試
npm run test:e2e

# Watch 模式（開發時）
npm run test:watch

# 覆蓋率報告
npm run test:coverage

# 所有測試
npm test
```

---

## 🔄 Pull Request 流程

### 建立 PR 前檢查清單

**自我檢查：**
- [ ] 代碼通過 ESLint 檢查（`npm run lint`）
- [ ] 所有測試通過（`npm test`）
- [ ] 測試覆蓋率達標（≥ 85%）
- [ ] 更新相關文件
- [ ] Commit message 符合規範
- [ ] 無 `console.log`（除非刻意留下）
- [ ] 敏感資料已移除（API Key、密碼）

### PR 標題與描述

**PR 標題格式：**
```
<type>: <short description>

範例：
feat: add Telegram bot integration
fix: resolve sync conflict error
refactor: improve expense parser performance
```

**PR 描述範本：**
```markdown
## 🎯 變更目的
解決 #123（連結到 Issue）

新增 Telegram Bot 整合功能，讓用戶可以透過 Telegram 快速記帳。

## 📝 變更內容
- 整合 `node-telegram-bot-api`
- 新增 `/spend` 指令
- 新增帳號綁定流程
- 更新 API 文件

## 🧪 測試
- [x] Unit Tests: 15 個測試全部通過
- [x] Integration Tests: 3 個測試通過
- [x] E2E Tests: 手動測試完成
- [x] 測試覆蓋率: 92%

## 📸 截圖（如有 UI 變更）
![Telegram Bot](https://example.com/screenshot.png)

## ✅ 檢查清單
- [x] 代碼通過 ESLint
- [x] 所有測試通過
- [x] 文件已更新
- [x] 無破壞性變更（或已標註 BREAKING CHANGE）
```

### Code Review 標準

**Reviewer 檢查項目：**

1. **功能正確性**
   - ✅ 實作符合需求
   - ✅ 邊界案例處理正確
   - ✅ 錯誤處理完善

2. **代碼品質**
   - ✅ 遵循命名規範
   - ✅ 無重複代碼（DRY 原則）
   - ✅ 函數長度合理（< 50 行）
   - ✅ 職責單一（Single Responsibility）

3. **測試**
   - ✅ 測試覆蓋關鍵邏輯
   - ✅ 測試可讀性高
   - ✅ 無假陽性測試

4. **安全性**
   - ✅ 無 SQL Injection 風險
   - ✅ 無 XSS 風險
   - ✅ 敏感資料已加密
   - ✅ 權限檢查正確

5. **效能**
   - ✅ 無 N+1 查詢問題
   - ✅ 查詢有適當索引
   - ✅ 無記憶體洩漏風險

### Review 回覆範例

**建設性回饋：**
```markdown
# ✅ 良好範例
💡 建議：這裡可以用 `Array.map()` 簡化邏輯

\`\`\`typescript
// 目前寫法
const results = [];
for (const item of items) {
  results.push(transform(item));
}

// 建議改為
const results = items.map(transform);
\`\`\`

# ❌ 不良範例
這裡寫得不好。  ← 沒有說明原因
改一下。        ← 沒有給出具體建議
```

### Merge 策略

**使用 Squash and Merge：**
- ✅ 保持 main 分支歷史簡潔
- ✅ 一個 PR = 一個 commit
- ✅ Commit message 自動生成（PR 標題）

**範例：**
```bash
# PR #123: feat: add Telegram bot integration
# 包含 15 個 commits → Squash 成 1 個 commit

# main 分支歷史
* feat: add Telegram bot integration (#123)
* fix: resolve sync conflict error (#122)
* refactor: improve expense parser (#121)
```

---

## 💡 開發最佳實踐

### TDD 開發流程

**Red → Green → Refactor：**

```typescript
// 1. Red - 先寫失敗測試
it('應該計算下個月扣款日期', () => {
  const result = calculateNextBilling({
    cycle: 'MONTHLY',
    lastBilling: new Date('2025-01-15')
  });

  expect(result).toEqual(new Date('2025-02-15'));
});

// 執行測試 → ❌ FAIL（函數還不存在）

// 2. Green - 寫最小實現讓測試通過
function calculateNextBilling(sub: Subscription): Date {
  const last = new Date(sub.lastBilling);
  return new Date(last.getFullYear(), last.getMonth() + 1, last.getDate());
}

// 執行測試 → ✅ PASS

// 3. Refactor - 優化代碼（測試保持綠燈）
function calculateNextBilling(sub: Subscription): Date {
  const last = new Date(sub.lastBilling);

  // 處理月底日期（如 1/31 → 2/28）
  const nextMonth = last.getMonth() + 1;
  const maxDay = new Date(last.getFullYear(), nextMonth + 1, 0).getDate();
  const day = Math.min(last.getDate(), maxDay);

  return new Date(last.getFullYear(), nextMonth, day);
}

// 執行測試 → ✅ PASS（功能更完善）
```

### 錯誤處理

**使用自訂 Error 類別：**

```typescript
// domain/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidAmountError extends AppError {
  constructor(amount: number) {
    super('INVALID_AMOUNT', `金額必須大於 0，但收到 ${amount}`, 400);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: string) {
    super('RATE_LIMIT_EXCEEDED', `速率限制，請於 ${retryAfter} 後重試`, 429);
  }
}

// 使用範例
throw new InvalidAmountError(0);
```

### 非同步處理

**使用 async/await（避免 callback hell）：**

```typescript
// ✅ 良好範例
async function createExpense(input: string): Promise<Expense> {
  try {
    const parsed = await parseExpense(input);
    const expense = await expenseRepo.save(parsed);
    await notifyUser(expense);
    return expense;
  } catch (error) {
    logger.error('Failed to create expense', error);
    throw error;
  }
}

// ❌ 不良範例（callback hell）
function createExpense(input: string, callback: (err, result) => void) {
  parseExpense(input, (err, parsed) => {
    if (err) return callback(err);
    expenseRepo.save(parsed, (err, expense) => {
      if (err) return callback(err);
      notifyUser(expense, (err) => {
        if (err) return callback(err);
        callback(null, expense);
      });
    });
  });
}
```

### 效能優化

**資料庫查詢優化：**

```typescript
// ❌ N+1 查詢問題
async function getUserExpensesWithCategories(userId: string) {
  const expenses = await prisma.expense.findMany({ where: { userId } });

  // 每個 expense 都查詢一次（N+1）
  for (const expense of expenses) {
    expense.category = await prisma.category.findUnique({
      where: { id: expense.categoryId }
    });
  }

  return expenses;
}

// ✅ 使用 include 一次取得
async function getUserExpensesWithCategories(userId: string) {
  return prisma.expense.findMany({
    where: { userId },
    include: { category: true },  // JOIN 查詢
    take: 100,  // 限制數量
    orderBy: { date: 'desc' }
  });
}
```

### 安全編碼

**防止注入攻擊：**

```typescript
// ✅ 使用 Prisma（自動防 SQL Injection）
await prisma.expense.findMany({
  where: { userId: userInput }  // 自動參數化
});

// ❌ 避免原始 SQL（除非必要）
await prisma.$queryRaw`
  SELECT * FROM expenses WHERE user_id = ${userInput}
`;

// ✅ 如需原始 SQL，使用參數化查詢
await prisma.$queryRaw`
  SELECT * FROM expenses WHERE user_id = ${Prisma.raw(userInput)}
`;
```

---

## 🚀 常見問題 FAQ

### Q1: 如何執行單一測試檔案？

```bash
# Vitest
npx vitest run __tests__/unit/parseExpense.spec.ts

# 或使用 describe.only / it.only
describe.only('parseExpense', () => {
  // 只執行這個 describe block
});
```

### Q2: 如何 Debug 測試？

```typescript
// 1. 使用 VS Code Debugger
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:debug"],
  "console": "integratedTerminal"
}

// 2. 在測試中使用 console.log（暫時）
it('test', async () => {
  const result = await someFunction();
  console.log('Debug:', result);  // 暫時 debug 用
  expect(result).toBe(expected);
});
```

### Q3: 如何處理 Merge Conflict？

```bash
# 1. 更新本地 main 分支
git checkout main
git pull origin main

# 2. Rebase 你的分支
git checkout feature/my-feature
git rebase main

# 3. 解決衝突
# （手動編輯檔案，移除 <<<<, ====, >>>> 標記）

# 4. 標記為已解決
git add <resolved-file>
git rebase --continue

# 5. 強制推送（因為 rebase 改寫歷史）
git push --force-with-lease
```

### Q4: 如何回滾錯誤的 Commit？

```bash
# 方法 1: 撤銷最後一次 commit（保留變更）
git reset --soft HEAD~1

# 方法 2: 撤銷最後一次 commit（捨棄變更）
git reset --hard HEAD~1

# 方法 3: 建立新 commit 撤銷（推薦用於已 push 的 commit）
git revert <commit-hash>
```

---

## 📞 聯絡資訊

**技術問題：**
- Slack: #engineering
- Email: dev@quicksmart.app

**Code Review 請求：**
- 標註 Reviewer: @tech-lead
- 緊急 PR: 標註 🚨 emoji

**Bug 回報：**
- GitHub Issues: https://github.com/your-org/quicksmart/issues
- 範本：使用 `.github/ISSUE_TEMPLATE/bug_report.md`

---

**文件版本：v1.0**
**最後更新：2025-10-20**
**維護者：技術團隊**
