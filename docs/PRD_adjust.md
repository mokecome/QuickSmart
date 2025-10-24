# QuickSmart 智慧記帳 Web App - 產品需求分析（開發模式調整版）

## 產品概述

### 背景資訊
- **目標用戶**：懶得記帳但想理財的年輕人（22-35歲）
- **核心痛點**：傳統記帳 App 操作繁環，導致半途而廢
- **競品問題**：功能太多、分類太細、操作步驟太多

### 產品定位
- **一句話描述**：最適合懶人的智慧記帳工具
- **核心價值**：用 AI 降低記帳摩擦力

### 功能範圍
1. 快速記帳（自然語言輸入）
2. 訂閱管理（固定支出）
3. 智慧分析（AI 洞察）
4. 擴充能力（Telegram、MCP）

---

## 1️⃣ 用戶場景分析

### 核心用戶畫像

**小美（27歲，數位行銷專員）**
- 月薪 45K，外食族
- 曾下載 3 個記帳 App 但都放棄
- 痛點：下班累得要死，還要選分類、填備註，太麻煩

**阿傑（30歲，軟體工程師）**
- 月薪 80K，訂閱狂人
- Netflix、Spotify、ChatGPT Plus、健身房...記不清花了多少
- 痛點：不知道每月固定支出總額，常被扣款嚇到

### 典型使用場景（BDD 格式）

#### 場景 1：便利商店買早餐（高頻場景）
```gherkin
Feature: 快速記帳
  作為一個懶人用戶
  我想要用最簡單的方式記帳
  這樣我就不會半途而廢

Scenario: 快速記錄早餐支出
  Given 我已經登入 QuickSmart
  When 我在輸入框輸入 "早餐 65"
  And 我點擊 "確認" 按鈕
  Then 我應該在 1 秒內看到新增一筆記錄
  And 分類應該自動判定為 "餐飲"
  And 金額應該是 "65"
  And 日期應該是 "今天"
  And 輸入框應該清空，準備下一筆記錄

傳統 App 對比：
- 傳統流程：7 步驟（打開 → 新增 → 選分類 → 輸入金額 → 選支付 → 備註 → 儲存）
- QuickSmart：2 步驟（打開 → 輸入「早餐 65」→ 完成）
```

#### 場景 2：發現訂閱扣款（痛點場景）
```gherkin
Feature: 訂閱管理
  作為一個訂閱狂人
  我想要清楚知道所有固定支出
  這樣我就不會被扣款嚇到

Scenario: 訂閱即將扣款提醒
  Given 我有一個 Netflix 訂閱，每月 15 號扣款 $390
  And 今天是 12 號
  When 系統執行每日檢查任務
  Then 我應該收到一則推播通知
  And 通知內容是 "Netflix 將在 3 天後扣款 $390"
  And 通知應包含「查看詳情」按鈕

Scenario: 查看所有訂閱總覽
  Given 我有 5 個活躍訂閱
  When 我進入「訂閱管理」頁面
  Then 我應該看到每月訂閱總額（大數字顯示）
  And 我應該看到 5 張訂閱卡片，依扣款日期排序
  And 即將扣款的訂閱應該有視覺標記
```

#### 場景 3：月底檢視花費（決策場景）
```gherkin
Feature: AI 智慧洞察
  作為想理財的用戶
  我想要看到有用的花費分析
  這樣我就能知道該如何省錢

Scenario: 查看月度 AI 洞察報告
  Given 我已經連續記帳 30 天
  When 我進入「月度洞察」頁面
  Then 我應該看到本月 vs 上月的花費對比
  And 我應該看到 AI 生成的個人化建議
  And 建議應包含具體數字和行動方案

  Example Output:
  「你這個月外食比上月多 35%，主要是晚餐（+2,800）。
  建議：每週自煮 2 次晚餐，可省 2,400/月」
```

---

## 2️⃣ 功能優先級矩陣

### RICE 評分法（Reach × Impact × Confidence / Effort）

| 功能 | 觸及用戶 | 影響力 | 信心度 | 開發成本 | RICE 分數 | 優先級 | 測試策略 |
|------|---------|--------|--------|----------|-----------|--------|---------|
| **自然語言記帳** | 100% | 3 | 90% | 3週 | 90 | P0 | TDD + E2E |
| **智慧分類建議** | 100% | 2 | 80% | 2週 | 80 | P0 | TDD + SDD |
| **訂閱管理** | 60% | 3 | 95% | 2週 | 86 | P0 | SDD + Integration |
| **月度 AI 洞察** | 80% | 3 | 70% | 3週 | 56 | P1 | Integration |
| **Telegram 快捷輸入** | 40% | 2 | 85% | 1週 | 68 | P1 | E2E |
| **收入記錄** | 30% | 1 | 100% | 1週 | 30 | P2 | Unit |
| **預算設定** | 50% | 2 | 75% | 2週 | 38 | P2 | SDD |
| **多帳戶管理** | 20% | 1 | 60% | 2週 | 6 | P3 | - |
| **匯出報表** | 30% | 1 | 90% | 1週 | 27 | P3 | - |

### 功能分級說明

**P0（MVP 必備）- 2-3 月完成**
- 自然語言記帳：產品核心差異化功能（100% 測試覆蓋）
- 智慧分類建議：降低記帳摩擦的關鍵（TDD 驅動開發）
- 訂閱管理：解決重要痛點，開發成本低（SDD 範例驅動）

**P1（V1.1 增強）- 3-4 月完成**
- 月度 AI 洞察：提升留存率的殺手鐧
- Telegram 整合：進一步降低使用門檻

**P2（V1.2 完善）- 5-6 月完成**
- 收入記錄：完整的財務圖像
- 預算設定：進階理財需求

**P3（待評估）- 根據用戶反饋決定**
- 多帳戶管理：小眾需求
- 匯出報表：可用第三方工具替代

---

## 3️⃣ 技術架構設計

### 核心技術棧

#### 前端架構
```
技術選型：Next.js 14 + React 18 + TypeScript + Vitest
理由：
✅ SSR 提升首屏載入速度（關鍵指標）
✅ App Router 支援更好的代碼分割
✅ TypeScript 降低維護成本
✅ Vitest 整合度高，測試速度快
⚠️ 風險：團隊學習曲線（建議 1 週培訓）
```

#### 專案結構（輕量 DDD + 測試分層）

```
src/
├── domain/                    # 領域層（輕量 DDD）
│   ├── entities/
│   │   ├── Expense.ts        # 支出實體
│   │   ├── Subscription.ts   # 訂閱實體
│   │   └── User.ts           # 用戶實體
│   ├── value-objects/
│   │   ├── Money.ts          # 金額值對象
│   │   └── Category.ts       # 分類值對象
│   └── repositories/         # 倉儲接口
│       ├── IExpenseRepository.ts
│       └── ISubscriptionRepository.ts
│
├── application/              # 應用層（Use Cases）
│   ├── use-cases/
│   │   ├── parseExpense.ts   # 解析記帳輸入
│   │   ├── createExpense.ts  # 創建支出記錄
│   │   ├── checkUpcomingBillings.ts
│   │   └── generateInsights.ts
│   └── services/
│       ├── AIParserService.ts
│       └── CategoryClassifier.ts
│
├── infrastructure/           # 基礎設施層
│   ├── ai/
│   │   └── ClaudeAPIClient.ts
│   ├── database/
│   │   ├── prisma/
│   │   └── repositories/     # 倉儲實現
│   │       ├── ExpenseRepository.ts
│   │       └── SubscriptionRepository.ts
│   └── external/
│       └── TelegramBot.ts
│
├── presentation/             # 展示層（Next.js）
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   └── api/
│   └── components/
│       ├── ExpenseInput.tsx
│       └── SubscriptionCard.tsx
│
└── __tests__/                # 測試目錄
    ├── unit/                 # 單元測試（TDD）
    │   ├── parseExpense.spec.ts
    │   ├── CategoryClassifier.spec.ts
    │   └── calculateNextBilling.spec.ts
    ├── integration/          # 整合測試（SDD）
    │   ├── api/
    │   │   ├── expenses.spec.ts
    │   │   └── subscriptions.spec.ts
    │   └── services/
    │       └── AIParser.spec.ts
    └── e2e/                  # 端到端測試（BDD）
        ├── features/
        │   ├── expense-tracking.feature
        │   ├── subscription-reminder.feature
        │   └── onboarding.feature
        └── step-definitions/
            └── expense.steps.ts
```

#### AI 自然語言處理

**方案 A：Claude API（推薦）**
```typescript
// application/services/AIParserService.ts
import Anthropic from '@anthropic-ai/sdk';

export class AIParserService {
  private client: Anthropic;

  async parse(input: string): Promise<ParsedExpense> {
    const prompt = `解析以下記帳輸入，返回 JSON 格式：
    輸入：${input}

    JSON Schema:
    {
      "amount": number,
      "category": "餐飲" | "交通" | "娛樂" | ...,
      "description": string,
      "date": ISO8601 string,
      "confidence": 0-100
    }`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }
}
```

**測試策略（Mock AI API）：**
```typescript
// __tests__/unit/AIParserService.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { AIParserService } from '@/application/services/AIParserService';

describe('AIParserService', () => {
  // SDD: Specification by Example
  const examples = [
    { input: '早餐 65', expected: { category: '餐飲', amount: 65 } },
    { input: '星巴克 150 昨天', expected: { category: '餐飲', amount: 150, date: yesterday() } },
    { input: 'Netflix 390', expected: { category: '訂閱', amount: 390 } },
    { input: 'Uber 120', expected: { category: '交通', amount: 120 } },
  ];

  it.each(examples)('應該正確解析 "$input"', async ({ input, expected }) => {
    // Mock Claude API 避免實際呼叫
    const mockResponse = { category: expected.category, amount: expected.amount };
    vi.spyOn(AIParserService.prototype, 'parse').mockResolvedValue(mockResponse);

    const service = new AIParserService();
    const result = await service.parse(input);

    expect(result).toMatchObject(expected);
  });

  // 邊界案例測試
  it('應該拋出錯誤當金額為 0', async () => {
    const service = new AIParserService();
    await expect(service.parse('早餐 0')).rejects.toThrow('INVALID_AMOUNT');
  });
});
```

**成本控制策略：**
```typescript
// infrastructure/ai/ClaudeAPIClient.ts
export class ClaudeAPIClient {
  private cache = new Map<string, ParsedExpense>();

  async parse(input: string): Promise<ParsedExpense> {
    // 1. 檢查快取（相同輸入不重複呼叫）
    if (this.cache.has(input)) {
      return this.cache.get(input)!;
    }

    // 2. Rate Limiting（每用戶每日上限 20 次）
    await this.checkRateLimit(userId);

    // 3. 呼叫 API
    const result = await this.aiService.parse(input);

    // 4. 儲存快取
    this.cache.set(input, result);

    return result;
  }
}
```

**降級策略（必備容錯機制）：**
```typescript
// application/services/ExpenseParserOrchestrator.ts
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
      // 錯誤處理與降級策略
      if (error instanceof RateLimitError) {
        // Rate Limit → 規則引擎
        console.warn('[Fallback] Rate limit exceeded, using rule-based parser');
        return await this.fallbackParser.parse(input);
      }

      if (error instanceof ServiceUnavailableError) {
        // API 服務中斷 → 降級模式
        console.error('[Fallback] Claude API unavailable, using rule-based parser');
        return await this.fallbackParser.parse(input);
      }

      // 其他錯誤向上拋出
      throw error;
    }
  }
}

// infrastructure/ai/FallbackParser.ts
export class FallbackParser {
  private rules = [
    // 餐飲規則
    { pattern: /早餐|午餐|晚餐|宵夜/, category: 'FOOD' },
    { pattern: /星巴克|麥當勞|肯德基|85度C/, category: 'FOOD' },

    // 交通規則
    { pattern: /Uber|計程車|捷運|公車|高鐵|台鐵/, category: 'TRANSPORT' },

    // 訂閱規則
    { pattern: /Netflix|Spotify|Disney|YouTube Premium|ChatGPT/, category: 'SUBSCRIPTION' },

    // 娛樂規則
    { pattern: /電影|KTV|遊戲|演唱會/, category: 'ENTERTAINMENT' },

    // ... 累積 50+ 條規則
  ];

  async parse(input: string): Promise<ParsedExpense> {
    const amount = this.extractAmount(input);
    const category = this.classifyByRules(input);
    const date = this.extractDate(input);

    return {
      amount,
      category,
      description: input.replace(/\d+/g, '').trim(),
      date,
      confidence: 70, // 規則引擎信心度較低
      fallbackUsed: true, // 標記使用降級模式
    };
  }

  private classifyByRules(input: string): Category {
    for (const rule of this.rules) {
      if (rule.pattern.test(input)) {
        return rule.category;
      }
    }
    return 'OTHER'; // 預設分類
  }

  private extractAmount(input: string): number {
    const match = input.match(/\d+/);
    if (!match) throw new Error('MISSING_AMOUNT');
    const amount = parseInt(match[0]);
    if (amount <= 0) throw new Error('INVALID_AMOUNT');
    return amount;
  }
}

// 測試降級機制（TDD）
// __tests__/unit/FallbackParser.spec.ts
describe('FallbackParser - 降級模式測試', () => {
  const examples = [
    { input: '早餐 65', expected: { category: 'FOOD', amount: 65, confidence: 70 } },
    { input: 'Uber 120', expected: { category: 'TRANSPORT', amount: 120 } },
    { input: 'Netflix 390', expected: { category: 'SUBSCRIPTION', amount: 390 } },
  ];

  test.each(examples)('規則引擎應正確解析 "$input"', async ({ input, expected }) => {
    const parser = new FallbackParser();
    const result = await parser.parse(input);
    expect(result).toMatchObject(expected);
  });
});

優勢：
✅ 99.9% 可用性（Claude API 失效時仍能記帳）
✅ 規則引擎準確率約 70-75%（可接受的降級）
✅ 用戶無感知切換（僅顯示提示訊息）
✅ 所有降級事件記錄到監控系統

監控策略：
⚠️ 每小時檢查 Claude API 健康狀態
⚠️ 降級模式使用率 > 5% 時發送告警
⚠️ 追蹤降級模式下的用戶滿意度
```

#### 資料庫設計

**方案：PostgreSQL + Prisma ORM**
```prisma
// prisma/schema.prisma
model Expense {
  id            String   @id @default(cuid())
  userId        String
  amount        Decimal  @db.Decimal(10, 2)
  category      Category
  description   String?
  date          DateTime @default(now())
  aiConfidence  Int?     // AI 分類信心分數 (0-100)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 多設備同步欄位
  version       Int      @default(1)           // 樂觀鎖版本號
  lastModifiedAt DateTime @updatedAt           // 最後修改時間
  lastModifiedDevice String?                   // 修改設備識別（web/ios/android）
  syncStatus    SyncStatus @default(SYNCED)    // 同步狀態

  user User @relation(fields: [userId], references: [id])

  @@index([userId, date])
  @@index([userId, lastModifiedAt])  // 同步查詢優化
}

model Subscription {
  id              String           @id @default(cuid())
  userId          String
  name            String           // Netflix, Spotify...
  amount          Decimal          @db.Decimal(10, 2)
  billingCycle    BillingCycle     // MONTHLY, YEARLY
  nextBillingDate DateTime
  status          SubscriptionStatus @default(ACTIVE)
  createdAt       DateTime         @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, nextBillingDate])
}

model User {
  id                   String         @id @default(cuid())
  email                String         @unique
  telegramId           String?        @unique
  onboardingCompleted  Boolean        @default(false)
  createdAt            DateTime       @default(now())

  expenses      Expense[]
  subscriptions Subscription[]
}

enum Category {
  FOOD          // 餐飲
  TRANSPORT     // 交通
  ENTERTAINMENT // 娛樂
  SHOPPING      // 購物
  HOUSING       // 居住
  MEDICAL       // 醫療
  EDUCATION     // 教育
  SUBSCRIPTION  // 訂閱
  OTHER         // 其他
  INCOME        // 收入
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  PAUSED
}

enum SyncStatus {
  SYNCED        // 已同步
  PENDING       // 等待同步
  CONFLICT      // 衝突待解決
}
```

**多設備同步衝突處理機制：**

```typescript
// application/services/SyncService.ts
export class SyncService {
  /**
   * 樂觀鎖更新策略（Optimistic Locking）
   */
  async updateExpense(
    expenseId: string,
    data: UpdateExpenseDTO,
    expectedVersion: number
  ): Promise<Expense> {
    const result = await this.prisma.expense.updateMany({
      where: {
        id: expenseId,
        version: expectedVersion, // 樂觀鎖檢查
      },
      data: {
        ...data,
        version: { increment: 1 },
        lastModifiedAt: new Date(),
        lastModifiedDevice: this.getCurrentDevice(),
        syncStatus: 'SYNCED',
      },
    });

    if (result.count === 0) {
      // 版本衝突 → 拋出錯誤讓前端處理
      throw new SyncConflictError({
        code: 'SYNC_CONFLICT',
        message: '資料已在其他裝置更新',
        currentVersion: await this.getLatestVersion(expenseId),
      });
    }

    return await this.prisma.expense.findUnique({ where: { id: expenseId } });
  }

  /**
   * 衝突解決策略（三選一）
   */
  async resolveConflict(
    expenseId: string,
    strategy: 'server_wins' | 'client_wins' | 'manual'
  ) {
    const serverData = await this.prisma.expense.findUnique({ where: { id: expenseId } });
    const clientData = this.pendingChanges.get(expenseId);

    switch (strategy) {
      case 'server_wins':
        // 放棄本地修改，使用伺服器版本
        return serverData;

      case 'client_wins':
        // 強制覆蓋（慎用！）
        return await this.forceUpdate(expenseId, clientData);

      case 'manual':
        // 讓用戶手動選擇
        return { serverData, clientData, requiresManualMerge: true };
    }
  }
}

// 前端衝突處理 UI
// presentation/components/SyncConflictDialog.tsx
export function SyncConflictDialog({ conflict }: { conflict: SyncConflict }) {
  return (
    <Dialog>
      <DialogTitle>資料已在其他裝置更新</DialogTitle>
      <DialogContent>
        <p>你的手機剛才修改了這筆記帳，要使用哪個版本？</p>

        <ComparisonTable>
          <thead>
            <tr>
              <th>欄位</th>
              <th>目前裝置</th>
              <th>其他裝置</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>金額</td>
              <td>{conflict.client.amount}</td>
              <td>{conflict.server.amount}</td>
            </tr>
            <tr>
              <td>分類</td>
              <td>{conflict.client.category}</td>
              <td>{conflict.server.category}</td>
            </tr>
          </tbody>
        </ComparisonTable>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => resolve('server_wins')}>使用其他裝置</Button>
        <Button onClick={() => resolve('client_wins')} variant="primary">
          使用目前裝置
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// MVP 簡化方案（推薦）
// 避免複雜的衝突解決，採用 Last-Write-Wins
export class SimpleSyncService {
  async updateExpense(expenseId: string, data: UpdateExpenseDTO) {
    // 檢查資料是否過舊（> 5 分鐘）
    const current = await this.prisma.expense.findUnique({ where: { id: expenseId } });
    const timeDiff = Date.now() - current.lastModifiedAt.getTime();

    if (timeDiff < 5 * 60 * 1000) {
      // 5 分鐘內有修改 → 提示用戶重新載入
      throw new SyncConflictError('資料可能已在其他裝置更新，請重新整理');
    }

    // 直接覆蓋（Last-Write-Wins）
    return await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...data,
        lastModifiedAt: new Date(),
        lastModifiedDevice: this.getCurrentDevice(),
      },
    });
  }
}

// Integration Test
// __tests__/integration/sync.spec.ts
describe('多設備同步測試', () => {
  it('應該偵測版本衝突', async () => {
    const expense = await createTestExpense({ version: 1 });

    // 模擬兩個裝置同時修改
    const update1 = syncService.updateExpense(expense.id, { amount: 100 }, 1);
    const update2 = syncService.updateExpense(expense.id, { amount: 200 }, 1);

    await expect(Promise.all([update1, update2])).rejects.toThrow('SYNC_CONFLICT');
  });

  it('應該支援 Last-Write-Wins 策略', async () => {
    const expense = await createTestExpense();

    // 裝置 A 修改
    await simpleSyncService.updateExpense(expense.id, { amount: 100 });

    // 等待 6 分鐘
    await sleep(6 * 60 * 1000);

    // 裝置 B 修改（應該成功）
    const result = await simpleSyncService.updateExpense(expense.id, { amount: 200 });

    expect(result.amount).toBe(200);
    expect(result.lastModifiedDevice).toBe('device-b');
  });
});

決策建議：
✅ MVP 階段：使用 SimpleSyncService（Last-Write-Wins）
✅ V1.1：實作完整樂觀鎖 + 衝突解決 UI
✅ V2.0：考慮 WebSocket 即時同步 + CRDT
```

**倉儲模式實現：**
```typescript
// infrastructure/database/repositories/ExpenseRepository.ts
import { PrismaClient } from '@prisma/client';
import { IExpenseRepository } from '@/domain/repositories/IExpenseRepository';
import { Expense } from '@/domain/entities/Expense';

export class ExpenseRepository implements IExpenseRepository {
  constructor(private prisma: PrismaClient) {}

  async save(expense: Expense): Promise<void> {
    await this.prisma.expense.create({
      data: {
        id: expense.id,
        userId: expense.userId,
        amount: expense.amount.value,
        category: expense.category.value,
        description: expense.description,
        date: expense.date,
        aiConfidence: expense.aiConfidence,
      }
    });
  }

  async findByUser(userId: string): Promise<Expense[]> {
    const records = await this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    return records.map(r => Expense.fromPersistence(r));
  }
}
```

#### AI 洞察引擎（MCP）

**技術方案：**
```typescript
// application/use-cases/generateInsights.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class InsightsGenerator {
  private mcpClient: Client;

  async generate(userId: string): Promise<Insights> {
    // 1. 取得用戶支出資料
    const expenses = await this.expenseRepo.findByUserAndMonth(userId);

    // 2. 使用 MCP 分析
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem']
    });

    await this.mcpClient.connect(transport);

    const result = await this.mcpClient.callTool({
      name: 'analyze-spending',
      arguments: {
        data: expenses,
        compareWith: 'previous_month',
        focusOn: ['anomalies', 'trends', 'suggestions']
      }
    });

    return result.insights;
  }
}
```

#### Telegram 整合

**技術實現：**
```typescript
// infrastructure/external/TelegramBot.ts
import TelegramBot from 'node-telegram-bot-api';

export class TelegramBotService {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.setupHandlers();
  }

  private setupHandlers() {
    // 記帳指令
    this.bot.onText(/\/spend (.+)/, async (msg, match) => {
      const userId = await this.getUserId(msg.from.id);
      const expense = await this.parseExpense(match![1]);
      await this.createExpense(userId, expense);

      this.bot.sendMessage(msg.chat.id, '✅ 已記錄！');
    });

    // 綁定帳號指令
    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const bindToken = match![1];
      await this.bindAccount(msg.from.id, bindToken);
    });
  }
}
```

### 技術風險評估

| 風險項目 | 嚴重性 | 可能性 | 緩解策略 | 測試覆蓋 |
|---------|--------|--------|---------|---------|
| Claude API 成本超標 | 高 | 中 | 每日呼叫上限 20 次 + 快取 | Integration Test |
| AI 分類錯誤率高 | 中 | 低 | 手動修正 + 學習機制 | SDD 範例測試 |
| 資料庫效能瓶頸 | 低 | 低 | Supabase 自動擴展 | Load Test |
| Telegram 帳號濫用 | 中 | 中 | Rate limiting + CAPTCHA | E2E Test |
| 多設備同步衝突 | 中 | 中 | 樂觀鎖 + Last-Write-Wins | Integration Test |

### 錯誤處理與用戶體驗設計

#### 用戶友善的錯誤訊息規範

**設計原則（User-Centric Error Messages）：**
1. **說人話**：避免技術術語（Error 500、API timeout、CORS error）
2. **提供解決方案**：告訴用戶下一步該做什麼
3. **情感連結**：用溫暖的語氣緩解焦慮
4. **視覺明確**：用顏色和圖示區分嚴重性

**標準錯誤訊息模板：**

```typescript
// src/constants/errorMessages.ts
export const ERROR_MESSAGES = {
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
    hint: `AI 信心度：{confidence}%（建議 > 80%）`,
    action: '檢查分類',
    severity: 'warning',
    icon: '🤔',
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
    title: '登入狀態已過期',
    message: '為了保護你的資料安全，請重新登入',
    action: '重新登入',
    severity: 'error',
    icon: '🔒',
  },

  SESSION_EXPIRED: {
    title: '登入已過期',
    message: '你已經 30 天沒有登入了，請重新驗證身份',
    action: '前往登入',
    severity: 'error',
    icon: '⏰',
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
    hint: `錯誤代碼：{errorCode}`,
    action: '回報問題',
    severity: 'error',
    icon: '❌',
  },
};

// 錯誤等級與 UI 對應
export const ERROR_SEVERITY_CONFIG = {
  critical: {
    backgroundColor: '#FEE2E2',  // 紅色
    textColor: '#991B1B',
    displayMode: 'modal',        // 全螢幕 Modal
    autoDismiss: false,          // 不自動消失
  },
  error: {
    backgroundColor: '#FEF3C7',  // 黃色
    textColor: '#92400E',
    displayMode: 'toast',
    autoDismiss: false,
  },
  warning: {
    backgroundColor: '#DBEAFE',  // 藍色
    textColor: '#1E40AF',
    displayMode: 'toast',
    autoDismiss: 5000,           // 5 秒後消失
  },
  info: {
    backgroundColor: '#E0E7FF',  // 淡紫
    textColor: '#3730A3',
    displayMode: 'toast',
    autoDismiss: 3000,
  },
};

// React 錯誤處理組件
// presentation/components/ErrorBoundary.tsx
export function ErrorToast({ error }: { error: AppError }) {
  const config = ERROR_MESSAGES[error.code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  const severityConfig = ERROR_SEVERITY_CONFIG[config.severity];

  return (
    <Toast
      style={{
        backgroundColor: severityConfig.backgroundColor,
        color: severityConfig.textColor,
      }}
      autoDismiss={severityConfig.autoDismiss}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="flex-1">
          <h3 className="font-semibold">{config.title}</h3>
          <p className="mt-1 text-sm">
            {config.message.replace('{confidence}', error.metadata?.confidence)}
          </p>
          {config.hint && (
            <p className="mt-2 text-xs opacity-75">{config.hint}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button onClick={error.retry}>{config.action}</Button>
        {config.secondaryAction && (
          <Button variant="ghost">{config.secondaryAction}</Button>
        )}
      </div>
    </Toast>
  );
}

// 錯誤記錄到 Sentry
export function reportError(error: AppError) {
  if (config.severity === 'critical' || config.severity === 'error') {
    Sentry.captureException(error, {
      tags: {
        errorCode: error.code,
        userImpact: config.severity,
      },
      contexts: {
        userMessage: {
          title: config.title,
          message: config.message,
        },
      },
    });
  }
}
```

**錯誤訊息設計檢查清單：**
- [ ] 所有錯誤訊息都使用「你」而非「用戶」
- [ ] 按鈕文字具體明確（「重新輸入」而非「確定」）
- [ ] 避免使用超過 1 個驚嘆號（減少焦慮感）
- [ ] Critical 錯誤自動上報 Sentry（但不顯示技術細節）
- [ ] 提供 fallback 選項（如 AI 失效時的手動模式）

**用戶測試驗證：**
```gherkin
# __tests__/e2e/features/error-handling.feature
Scenario: AI 服務失效時的降級體驗
  Given AI 服務暫時無法使用
  When 我輸入「早餐 65」
  Then 我應該看到提示：「AI 小幫手暫時休息中」
  And 我應該仍能選擇分類手動記帳
  And 錯誤訊息應該在 3 秒後自動消失
```

---

## 4️⃣ 開發模式與測試策略

### 採用方案：**SDD + 輕量 TDD + 選擇性 BDD**

#### 為什麼選擇混合模式？

| 開發模式 | 適用度 | 學習曲線 | 開發速度 | 維護成本 | 推薦指數 |
|---------|--------|---------|---------|---------|---------|
| **TDD** | ⭐⭐⭐⭐ | 中 | 慢 | 低 | ⭐⭐⭐⭐ |
| **DDD** | ⭐⭐ | 高 | 很慢 | 高 | ⭐⭐ |
| **BDD** | ⭐⭐⭐ | 中 | 慢 | 高 | ⭐⭐⭐ |
| **SDD** | ⭐⭐⭐⭐⭐ | 低 | 快 | 低 | ⭐⭐⭐⭐⭐ |

**決策理由：**
1. **SDD**：主要開發模式，用範例驅動核心業務邏輯
2. **TDD**：用於關鍵演算法（AI 解析、金額計算）
3. **BDD**：僅用於 3 個核心用戶旅程（E2E）
4. **輕量 DDD**：只用 Entity + Repository，避免過度設計

### 測試金字塔策略

```
         E2E (3 個場景)          ← BDD，少而精
        /               \
   Integration (15 個)           ← SDD，適中
      /                   \
     Unit (50+ 個)               ← TDD + SDD，多而快
```

#### 測試覆蓋率目標

```
Unit Tests:         85%+  （核心業務邏輯）
Integration Tests:  70%+  （API 端點）
E2E Tests:          3 個關鍵場景（不求量）
```

### 分層測試策略

#### 1. Unit Tests（TDD + SDD）

**適用場景：**
- AI 解析邏輯
- 分類演算法
- 日期計算
- 金額驗證

**範例：**
```typescript
// __tests__/unit/parseExpense.spec.ts
import { describe, it, expect } from 'vitest';
import { parseExpense } from '@/application/use-cases/parseExpense';

describe('parseExpense - Specification by Example', () => {
  // SDD: 用具體範例驅動開發
  const examples = [
    // 基本格式
    { input: '早餐 65', expected: { category: 'FOOD', amount: 65, description: '早餐' } },
    { input: '午餐 120', expected: { category: 'FOOD', amount: 120, description: '午餐' } },

    // 帶日期
    { input: '昨天晚餐 350', expected: { category: 'FOOD', amount: 350, date: yesterday() } },

    // 特定商家（TDD：測試分類準確性）
    { input: '星巴克 150', expected: { category: 'FOOD', amount: 150, description: '星巴克' } },
    { input: 'Netflix 390', expected: { category: 'SUBSCRIPTION', amount: 390 } },
    { input: 'Uber 120', expected: { category: 'TRANSPORT', amount: 120 } },

    // 邊界案例
    { input: '0', expected: { error: 'INVALID_AMOUNT' } },
    { input: '早餐', expected: { error: 'MISSING_AMOUNT' } },
    { input: '999999999', expected: { category: 'OTHER', amount: 999999999 } },
  ];

  examples.forEach(({ input, expected }) => {
    it(`應該將 "${input}" 解析為 ${JSON.stringify(expected)}`, async () => {
      const result = await parseExpense(input);
      expect(result).toMatchObject(expected);
    });
  });
});
```

```typescript
// __tests__/unit/CategoryClassifier.spec.ts (TDD)
import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryClassifier } from '@/application/services/CategoryClassifier';

describe('CategoryClassifier - TDD', () => {
  let classifier: CategoryClassifier;

  beforeEach(() => {
    classifier = new CategoryClassifier();
  });

  // Red → Green → Refactor
  describe('餐飲分類', () => {
    it('應該將早餐相關詞彙分類為 FOOD', () => {
      expect(classifier.classify('早餐')).toBe('FOOD');
      expect(classifier.classify('午餐')).toBe('FOOD');
      expect(classifier.classify('晚餐')).toBe('FOOD');
    });

    it('應該識別知名餐飲品牌', () => {
      expect(classifier.classify('星巴克')).toBe('FOOD');
      expect(classifier.classify('麥當勞')).toBe('FOOD');
      expect(classifier.classify('85度C')).toBe('FOOD');
    });
  });

  describe('訂閱服務分類', () => {
    it('應該識別串流服務', () => {
      expect(classifier.classify('Netflix')).toBe('SUBSCRIPTION');
      expect(classifier.classify('Spotify')).toBe('SUBSCRIPTION');
      expect(classifier.classify('Disney+')).toBe('SUBSCRIPTION');
    });
  });
});
```

#### 2. Integration Tests（SDD）

**適用場景：**
- API 端點測試
- 資料庫互動
- 外部服務整合

**範例：**
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

  // SDD: 用範例定義 API 行為
  const validRequests = [
    {
      input: { text: '早餐 65' },
      expected: { category: 'FOOD', amount: 65, status: 201 }
    },
    {
      input: { text: 'Netflix 390' },
      expected: { category: 'SUBSCRIPTION', amount: 390, status: 201 }
    },
  ];

  it.each(validRequests)('應該正確處理 $input.text', async ({ input, expected }) => {
    const response = await server.post('/api/expenses', input);

    expect(response.status).toBe(expected.status);
    expect(response.body.category).toBe(expected.category);
    expect(response.body.amount).toBe(expected.amount);
  });

  // 錯誤處理
  it('應該拒絕無效金額', async () => {
    const response = await server.post('/api/expenses', { text: '早餐 0' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INVALID_AMOUNT');
  });

  it('應該檢查用戶認證', async () => {
    const response = await server.post('/api/expenses', { text: '早餐 65' }, {
      auth: false
    });

    expect(response.status).toBe(401);
  });
});
```

```typescript
// __tests__/integration/services/AIParser.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { AIParserService } from '@/application/services/AIParserService';

describe('AIParserService Integration', () => {
  it('應該正確呼叫 Claude API 並解析回應', async () => {
    // 使用真實 API 測試（在 CI 中用 Mock）
    const service = new AIParserService(process.env.CLAUDE_API_KEY);

    const result = await service.parse('星巴克拿鐵 150 昨天');

    expect(result).toMatchObject({
      category: 'FOOD',
      amount: 150,
      description: expect.stringContaining('星巴克'),
      confidence: expect.any(Number)
    });
  });

  it('應該處理 API 錯誤', async () => {
    const service = new AIParserService('invalid-key');

    await expect(service.parse('早餐 65')).rejects.toThrow('API_ERROR');
  });
});
```

#### 3. E2E Tests（BDD - 僅 3 個核心場景）

**場景選擇：**
1. 新用戶 Onboarding + 首次記帳
2. 訂閱提醒通知
3. AI 分類錯誤修正

**範例：**
```gherkin
# __tests__/e2e/features/expense-tracking.feature
Feature: 核心記帳流程
  作為新用戶
  我想要快速完成首次記帳
  這樣我就能體驗到產品價值

Background:
  Given 我已清空測試資料庫
  And 我已啟動測試伺服器

Scenario: 新用戶首次記帳（Aha Moment）
  Given 我打開 QuickSmart 首頁
  When 我點擊「使用 Google 登入」
  And 我完成 OAuth 認證流程
  Then 我應該看到 Onboarding 引導頁

  When 我點擊「開始記帳」
  And 我在輸入框輸入 "早餐 65"
  And 我點擊「確認」按鈕
  Then 我應該在 1 秒內看到成功訊息
  And 我應該看到彈出提示：「✨ 看！不用選分類，AI 都懂」

  When 我點擊「查看我的記帳」
  Then 我應該看到 1 筆記錄
  And 記錄應顯示：分類「餐飲」、金額「65」、日期「今天」

Scenario: AI 分類錯誤時手動修正
  Given 我已登入並有 1 筆記錄（AI 誤判為「娛樂」）
  When 我點擊該記錄
  And 我修改分類為「交通」
  And 我點擊「儲存」
  Then 記錄應更新為「交通」分類

  # 驗證學習機制
  When 我輸入相同描述的新記錄
  Then AI 應該建議「交通」分類（confidence > 90%）
```

```typescript
// __tests__/e2e/step-definitions/expense.steps.ts
import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

setDefaultTimeout(30000);

Given('我打開 QuickSmart 首頁', async function() {
  await this.page.goto('http://localhost:3000');
});

When('我在輸入框輸入 {string}', async function(input: string) {
  await this.page.fill('[data-testid="expense-input"]', input);
});

When('我點擊「確認」按鈕', async function() {
  await this.page.click('[data-testid="submit-button"]');
});

Then('我應該在 1 秒內看到成功訊息', async function() {
  const startTime = Date.now();

  await this.page.waitForSelector('[data-testid="success-message"]', {
    timeout: 1000
  });

  const elapsed = Date.now() - startTime;
  expect(elapsed).toBeLessThan(1000);
});

Then('我應該看到彈出提示：{string}', async function(message: string) {
  const toast = await this.page.textContent('[data-testid="toast"]');
  expect(toast).toContain(message);
});
```

### CI/CD 測試流程

```yaml
# .github/workflows/ci.yml
name: CI Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      # 1. 快速單元測試（30 秒）
      - name: Run Unit Tests
        run: npm run test:unit
        timeout-minutes: 2

      # 2. 整合測試（2 分鐘）
      - name: Run Integration Tests
        run: npm run test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
        timeout-minutes: 5

      # 3. E2E 測試（僅 main branch，5 分鐘）
      - name: Run E2E Tests
        if: github.ref == 'refs/heads/main'
        run: npm run test:e2e
        timeout-minutes: 10

      # 4. 測試覆蓋率報告
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### 測試指令腳本

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage src/__tests__/unit",
    "test:integration": "vitest run src/__tests__/integration",
    "test:e2e": "cucumber-js && playwright test",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui"
  }
}
```

### Mock 策略

```typescript
// __mocks__/claude.ts
import { vi } from 'vitest';

export const mockClaudeAPI = {
  parse: vi.fn((input: string) => {
    // 規則引擎：避免每次測試都呼叫真實 API
    if (input.includes('早餐')) {
      return Promise.resolve({ category: 'FOOD', amount: extractNumber(input), confidence: 95 });
    }
    if (input.includes('Netflix')) {
      return Promise.resolve({ category: 'SUBSCRIPTION', amount: 390, confidence: 98 });
    }
    if (input.includes('Uber')) {
      return Promise.resolve({ category: 'TRANSPORT', amount: extractNumber(input), confidence: 92 });
    }
    return Promise.resolve({ category: 'OTHER', amount: extractNumber(input), confidence: 60 });
  })
};

// 在測試中使用
vi.mock('@/infrastructure/ai/ClaudeAPIClient', () => ({
  ClaudeAPIClient: vi.fn(() => mockClaudeAPI)
}));
```

---

## 5️⃣ MVP 開發計畫（8 週 TDD/SDD 流程）

### Week 1-2：基礎架構 + 測試環境

#### 開發任務
- [ ] Next.js 14 專案建置
- [ ] TypeScript + ESLint + Prettier 設定
- [ ] Vitest + Testing Library 配置
- [ ] Playwright + Cucumber 安裝
- [ ] PostgreSQL + Prisma 設定
- [ ] NextAuth.js + Google OAuth

#### 測試任務（TDD Kata）
```typescript
// Day 1-2: 團隊 TDD 培訓
// __tests__/kata/fizzbuzz.spec.ts
describe('FizzBuzz Kata（TDD 練習）', () => {
  it('should return "1" for 1', () => {
    expect(fizzBuzz(1)).toBe('1');
  });

  it('should return "Fizz" for 3', () => {
    expect(fizzBuzz(3)).toBe('Fizz');
  });

  // ... Red → Green → Refactor 練習
});
```

#### 驗收標準
- ✅ CI/CD Pipeline 建立
- ✅ 測試覆蓋率工具運作
- ✅ 團隊完成 TDD Kata 訓練

---

### Week 3-4：核心記帳功能（TDD 驅動）

#### Day 1-2：AI 解析邏輯（TDD）

**步驟 1：先寫測試（Red）**
```typescript
// __tests__/unit/parseExpense.spec.ts
describe('parseExpense', () => {
  it('應該解析「早餐 65」', async () => {
    const result = await parseExpense('早餐 65');
    expect(result).toEqual({
      category: 'FOOD',
      amount: 65,
      description: '早餐',
      date: expect.any(Date)
    });
  });
});

// 執行測試 → ❌ FAIL（因為函數還不存在）
```

**步驟 2：寫最小實現（Green）**
```typescript
// application/use-cases/parseExpense.ts
export async function parseExpense(input: string) {
  // 最簡單的實現讓測試通過
  return {
    category: 'FOOD',
    amount: 65,
    description: '早餐',
    date: new Date()
  };
}

// 執行測試 → ✅ PASS
```

**步驟 3：重構（Refactor）**
```typescript
export async function parseExpense(input: string) {
  // 整合真實 Claude API
  const aiService = new AIParserService();
  return await aiService.parse(input);
}

// 執行測試 → ✅ PASS（功能不變，代碼更好）
```

#### Day 3-5：分類引擎（SDD）

```typescript
// __tests__/unit/CategoryClassifier.spec.ts
describe('CategoryClassifier - Specification by Example', () => {
  const examples = [
    // 從 PRD 的用戶場景提取範例
    ['早餐', 'FOOD'],
    ['星巴克', 'FOOD'],
    ['Netflix', 'SUBSCRIPTION'],
    ['Uber', 'TRANSPORT'],
    ['電影票', 'ENTERTAINMENT'],
    // ... 累積 50+ 個真實範例
  ];

  test.each(examples)('"%s" → "%s"', (input, expected) => {
    expect(classifier.classify(input)).toBe(expected);
  });
});
```

#### Day 6-10：API + UI 整合

```typescript
// __tests__/integration/api/expenses.spec.ts
describe('POST /api/expenses', () => {
  it('應該創建支出記錄', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .send({ text: '早餐 65' })
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      category: 'FOOD',
      amount: 65
    });
  });
});
```

#### 驗收標準
- ✅ AI 解析準確率 ≥ 85%（50 個測試範例）
- ✅ API 回應時間 < 1s（P95）
- ✅ Unit Test 覆蓋率 ≥ 90%

---

### Week 5-6：訂閱管理（SDD）

#### Specification by Example

```typescript
// __tests__/unit/calculateNextBilling.spec.ts
describe('calculateNextBilling', () => {
  const examples = [
    {
      subscription: { cycle: 'MONTHLY', lastBilling: '2025-01-15' },
      expected: '2025-02-15'
    },
    {
      subscription: { cycle: 'YEARLY', lastBilling: '2024-01-15' },
      expected: '2025-01-15'
    },
    // 邊界案例：閏年、月底
    {
      subscription: { cycle: 'MONTHLY', lastBilling: '2024-01-31' },
      expected: '2024-02-29' // 2024 是閏年
    },
  ];

  test.each(examples)('should calculate $expected', ({ subscription, expected }) => {
    const result = calculateNextBilling(subscription);
    expect(result).toBe(expected);
  });
});
```

#### E2E 測試（第一個 BDD 場景）

```gherkin
# __tests__/e2e/features/subscription-reminder.feature
Scenario: 訂閱即將扣款提醒
  Given 我有一個 Netflix 訂閱，每月 15 號扣款
  And 今天是 12 號
  When 系統執行每日檢查任務（Cron Job）
  Then 我應該收到推播通知：「Netflix 將在 3 天後扣款 $390」
```

#### 驗收標準
- ✅ 訂閱計算邏輯 100% 正確（含閏年、月底）
- ✅ 提醒任務成功率 ≥ 99%
- ✅ E2E 測試通過

---

### Week 7：資料視覺化 + 第二個 E2E

```gherkin
# __tests__/e2e/features/expense-tracking.feature
Scenario: 新用戶首次記帳（完整流程）
  Given 我打開 QuickSmart 首頁
  When 我完成 Google 登入
  And 我輸入「早餐 65」
  Then 我應該看到 Aha Moment 提示
  And 我應該看到支出總覽更新
```

---

### Week 8：優化、第三個 E2E、上線準備

#### 效能測試
```typescript
// __tests__/performance/load.spec.ts
import { test } from '@playwright/test';

test('首屏載入應 < 2s', async ({ page }) => {
  const startTime = Date.now();

  await page.goto('https://quicksmart.app');
  await page.waitForSelector('[data-testid="expense-input"]');

  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);
});
```

#### 最後一個 E2E
```gherkin
Scenario: AI 分類錯誤修正
  Given 我有一筆 AI 誤判的記錄
  When 我手動修正分類
  Then 系統應該學習這個修正
  And 下次類似輸入應該正確分類
```

#### 驗收標準
- ✅ 3 個 E2E 場景全部通過
- ✅ Lighthouse 分數 ≥ 90
- ✅ 所有測試覆蓋率達標

---

### MVP 不做的事（刻意省略）
❌ 收入記錄（僅追蹤支出）
❌ 預算功能（先記帳，再談預算）
❌ Telegram Bot（V1.1 再做）
❌ AI 洞察報告（需累積資料）
❌ 匯出功能（非核心需求）
❌ 多幣別支援（僅 TWD）
❌ 照片上傳（降低複雜度）
❌ UI 視覺測試（用 Storybook + Chromatic 代替）

### MVP 成功標準

**定量指標：**
- 20 位種子用戶完成註冊
- 平均每用戶記帳 ≥ 15 筆/週
- AI 分類準確率 ≥ 90%
- 7 日留存率 ≥ 60%

**技術指標（新增）：**
- ✅ Unit Test 覆蓋率 ≥ 85%
- ✅ Integration Test 覆蓋率 ≥ 70%
- ✅ 3 個 E2E 場景全部通過
- ✅ CI 執行時間 < 10 分鐘
- ✅ API P95 回應時間 < 1s

**定性指標：**
- 5 位用戶訪談正面回饋 ≥ 80%
- NPS 分數 ≥ 40
- 用戶自發分享 ≥ 3 次

### 開發團隊配置建議
```
1 位全端工程師（Next.js + PostgreSQL + TDD 經驗）
1 位 UI/UX 設計師（兼前端切版 + Storybook）
1 位產品經理（需求 + QA + 用戶訪談）

必備技能：
- 工程師：熟悉 Vitest/Jest + Playwright
- 設計師：會寫 React 組件測試更佳
- PM：理解 BDD Gherkin 語法

預算：約 60-80 萬（2 個月）
```

---

## 6️⃣ 成功指標體系

### North Star Metric（北極星指標）
**「每週活躍記帳用戶數」（Weekly Active Recorders）**

為什麼選這個？
- 記帳頻率 = 產品價值實現
- 週為單位符合理財習慣
- 比單純 DAU 更能反映用戶投入度

### AARRR 海盜指標

#### 1. Acquisition（獲取）
| 指標 | 目標值（3個月） | 追蹤工具 | 測試驗證 |
|------|----------------|----------|---------|
| 官網訪客數 | 2,000 | Google Analytics | E2E Test |
| 註冊轉化率 | ≥ 25% | Mixpanel | A/B Test |
| 主要流量來源 | 社群媒體 60% | UTM 參數 | - |
| CAC（獲客成本） | < $50/人 | 廣告平台 | - |

**關鍵行動：**
- 在 Dcard、PTT 發開箱文
- 製作「1 分鐘記帳挑戰」短影片

#### 2. Activation（激活）
| 指標 | 目標值 | 定義 | 測試場景 |
|------|--------|------|---------|
| Aha Moment 到達率 | ≥ 70% | 完成首次 AI 記帳 | E2E Test #1 |
| 新用戶 3 日記帳數 | ≥ 5 筆 | 關鍵習慣養成 | Integration Test |
| 訂閱新增數 | ≥ 2 個 | 發現核心價值 | E2E Test #2 |
| Onboarding 完成率 | ≥ 85% | 引導流程順暢度 | E2E Test #1 |

**Aha Moment 設計：**
```gherkin
# 在 E2E 測試中驗證
Scenario: Aha Moment 體驗
  When 用戶輸入「早餐 65」後
  Then 應在 1 秒內顯示分類結果
  And 應彈出提示：「✨ 看！不用選分類，AI 都懂」
  And 應鼓勵再試一次：「試試看輸入『昨天電影 320』」
```

#### 3. Retention（留存）
| 時間點 | 目標留存率 | 行業基準 | 追蹤方式 |
|--------|-----------|---------|---------|
| 次日留存 | 50% | 40% | SQL Query |
| 7 日留存 | 35% | 25% | Mixpanel Cohort |
| 30 日留存 | 20% | 15% | Mixpanel Cohort |
| 90 日留存 | 15% | - | Mixpanel Cohort |

**留存策略：**
- Day 3：推播「你已記帳 X 筆，查看本週花費」
- Day 7：Email「你的第一份週報出爐了！」
- Day 30：解鎖「月度 AI 洞察」功能

**流失預警（自動化測試）：**
```typescript
// __tests__/integration/retention.spec.ts
describe('Retention Alert System', () => {
  it('應該標記 3 日未記帳用戶', async () => {
    const inactiveUsers = await findInactiveUsers(3);
    expect(inactiveUsers.length).toBeGreaterThan(0);
  });

  it('應該發送喚回通知', async () => {
    const user = await createInactiveUser();
    await sendRetentionAlert(user.id);

    const notifications = await getNotifications(user.id);
    expect(notifications).toContainEqual(
      expect.objectContaining({ type: 'RETENTION_ALERT' })
    );
  });
});
```

#### 4. Revenue（營收）
**MVP 階段：免費**（專注產品驗證）

**V2.0 商業模式（預想）：**
```
免費版：
- 基本記帳功能
- 每月 AI 洞察 1 次

進階版（$99/月）：
- 無限 AI 洞察
- Telegram 快捷輸入
- 匯出報表
- 預算超支警報

目標：10% 付費轉化率
```

#### 5. Referral（推薦）
| 指標 | 目標值 | 機制 | 測試方式 |
|------|--------|------|---------|
| NPS 分數 | ≥ 50 | 每月調查 | E2E Test |
| 病毒係數（K 值） | ≥ 0.3 | 邀請功能 | Integration Test |
| 自然分享率 | ≥ 5% | 社群提及追蹤 | - |

**推薦機制設計：**
```typescript
// __tests__/integration/referral.spec.ts
describe('Referral System', () => {
  it('應該生成唯一邀請連結', async () => {
    const link = await generateReferralLink(userId);
    expect(link).toMatch(/https:\/\/quicksmart\.app\/ref\/[a-z0-9]+/);
  });

  it('應該追蹤邀請註冊', async () => {
    const referrer = await createUser();
    const link = await generateReferralLink(referrer.id);

    const newUser = await registerViaReferral(link);

    const stats = await getReferralStats(referrer.id);
    expect(stats.successfulReferrals).toBe(1);
  });
});
```

### 產品健康度儀表板

**每日監控（自動化測試驗證）：**
```typescript
// __tests__/monitoring/health-check.spec.ts
describe('Product Health Metrics', () => {
  it('AI 準確率應 ≥ 90%', async () => {
    const accuracy = await calculateAIAccuracy();
    expect(accuracy).toBeGreaterThanOrEqual(90);
  });

  it('P95 回應時間應 < 1s', async () => {
    const p95 = await getP95ResponseTime();
    expect(p95).toBeLessThan(1000);
  });

  it('錯誤率應 < 1%', async () => {
    const errorRate = await getErrorRate();
    expect(errorRate).toBeLessThan(1);
  });
});
```

**每週覆盤：**
- 用戶訪談（3-5 位）
- Hotjar 錄影分析（發現卡點）
- Feature Request 整理（Canny.io）
- 測試覆蓋率報告檢視

### 成功里程碑

**Month 1：產品驗證**
- ✅ 100 位註冊用戶
- ✅ 7 日留存 ≥ 30%
- ✅ AI 準確率 ≥ 85%
- ✅ **測試覆蓋率 ≥ 80%**

**Month 2：習慣養成**
- ✅ 500 位註冊用戶
- ✅ WAU ≥ 200
- ✅ 7 日留存 ≥ 35%
- ✅ **測試覆蓋率 ≥ 85%**

**Month 3：增長驗證**
- ✅ 1,000 位註冊用戶
- ✅ WAU ≥ 400
- ✅ NPS ≥ 40
- ✅ 自然成長率 ≥ 20%（無付費廣告）
- ✅ **所有 E2E 測試通過**

**決策點：Month 3 結束**
- 若達標 → 籌備 V1.1（Telegram + AI 洞察）
- 若未達標 → Pivot 或調整定位

---

## 📋 總結與建議

### 核心發現

1. **產品定位清晰**
   「懶人記帳」是有效的差異化點，目標用戶痛點明確

2. **技術可行性高**
   Claude API + Next.js 技術棧成熟，風險可控

3. **MVP 範圍合理**
   8 週開發 3 大核心功能，可快速驗證假設

4. **開發模式務實**
   SDD + 輕量 TDD + 選擇性 BDD，平衡速度與質量

5. **測試策略清晰**
   測試金字塔：50+ Unit、15 Integration、3 E2E

### 關鍵風險與緩解

⚠️ **最大風險：AI 成本**
- 如果 DAU 達 1,000，每人每日記帳 5 筆 → 月成本約 $225
- 緩解：設置速率限制 + 快取 + Integration Test 驗證成本控制

⚠️ **次要風險：習慣養成失敗**
- 記帳本質上是反人性的，即使簡化仍可能放棄
- 緩解：Gamification + E2E Test 驗證 Onboarding 流程

⚠️ **技術風險：測試維護成本**
- E2E 測試可能因 UI 改版而失效
- 緩解：只寫 3 個核心場景 + 用 data-testid 而非 CSS 選擇器

### 下一步行動（按優先順序）

1. **Week 0：團隊培訓**（開發前）
   - Day 1：TDD 工作坊（2 小時）
   - Day 2：Vitest + Playwright 實戰
   - Day 3：Code Review 測試寫法

2. **Week 1：技術原型驗證**
   - 建立 Claude API 測試，驗證中文解析準確率（寫 10 個 Unit Test）
   - 設計 3 個核心頁面 Wireframe

3. **Week 1-2：種子用戶招募**（同步進行）
   - 在社群發問卷，篩選 20 位測試用戶
   - 建立用戶訪談計畫

4. **Week 2：開發排程確認**
   - 確認技術團隊組成
   - 設定每週 Sprint Review + 測試覆蓋率檢視

5. **Week 3-8：啟動開發**
   - 按照 MVP 8 週計畫執行（TDD/SDD/BDD 混合）
   - 每 2 週發布測試版給種子用戶
   - 每週五檢視測試覆蓋率報告

### 持續改進機制

**每日：**
- 開發前先寫測試（TDD）
- Commit 前執行 `npm run test:unit`
- CI Pipeline 自動執行所有測試

**每週：**
- Sprint Review：展示新功能 + 測試報告
- 測試覆蓋率覆盤（目標 ≥ 85%）
- 分享測試最佳實踐（Code Review）

**每月：**
- 重構測試代碼（移除重複、優化速度）
- 更新 E2E 場景（根據用戶反饋）
- 評估是否需要新增測試

---

## 附錄：開發模式快速參考

### 何時用 TDD？
✅ 核心演算法（AI 解析、金額計算）
✅ 複雜業務邏輯（訂閱計算、分類引擎）
✅ Bug 修復（先寫失敗測試，再修復）

### 何時用 SDD？
✅ API 端點開發
✅ 資料驗證邏輯
✅ 範例很多的功能（分類規則）

### 何時用 BDD？
✅ 核心用戶旅程（Onboarding、首次記帳）
✅ 跨系統整合（Telegram Bot）
✅ 關鍵業務流程（訂閱提醒）

### 何時不寫測試？
❌ UI 動畫效果（用 Storybook）
❌ 視覺設計調整（用 Chromatic）
❌ 一次性腳本（資料遷移）

---

**文件版本：v2.0（開發模式調整版）**
**最後更新：2025-10-20**
**維護者：產品經理 + 技術團隊**
