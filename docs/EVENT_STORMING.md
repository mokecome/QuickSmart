# QuickSmart 智能記帳 - Event Storming 分析

**版本**: v1.0
**日期**: 2025-10-20
**基於**: PRD_SDD.md + PRD_adjust.md

---

## 📋 目錄
1. [領域事件 (Domain Events)](#領域事件)
2. [命令 (Commands)](#命令)
3. [聚合 (Aggregates)](#聚合)
4. [事件流程圖](#事件流程圖)
5. [邊界上下文 (Bounded Contexts)](#邊界上下文)
6. [上下文映射 (Context Mapping)](#上下文映射)
7. [熱點與風險](#熱點與風險)

---

## 🟠 領域事件 (Domain Events)

### 核心記帳流程

| 事件名稱 | 觸發時機 | 資料負載 | 訂閱者 |
|---------|---------|---------|--------|
| **ExpenseInputReceived** | 用戶提交記帳輸入 | `{ text, userId, timestamp }` | AIParserService |
| **ExpenseParsed** | AI 解析完成 | `{ amount, category, description, confidence }` | ExpenseRepository |
| **CategorySuggested** | 分類建議產生 | `{ category, alternatives, confidence }` | UI Layer |
| **ExpenseCreated** | 支出記錄已創建 | `{ expenseId, userId, amount, category }` | Analytics, Cache |
| **CategoryCorrected** | 用戶修正分類 | `{ expenseId, oldCategory, newCategory }` | LearningService |
| **AILearned** | AI 學習新樣本 | `{ inputText, correctCategory, userId }` | AIModelTrainer |

### 訂閱管理流程

| 事件名稱 | 觸發時機 | 資料負載 | 訂閱者 |
|---------|---------|---------|--------|
| **SubscriptionAdded** | 訂閱新增成功 | `{ subscriptionId, name, amount, cycle }` | BillingCalculator |
| **BillingDateCalculated** | 下次扣款日計算完成 | `{ subscriptionId, nextBillingDate, daysUntil }` | ReminderScheduler |
| **BillingReminderScheduled** | 提醒已排程 | `{ subscriptionId, scheduledTime }` | Cron Job |
| **BillingReminderSent** | 提醒已發送 | `{ subscriptionId, channel, sentAt }` | Notification |
| **SubscriptionBilled** | 訂閱已扣款 | `{ subscriptionId, amount, date }` | ExpenseService |
| **ExpenseAutoCreated** | 自動記帳完成 | `{ expenseId, subscriptionId, amount }` | User Notification |
| **SubscriptionCancelled** | 訂閱已取消 | `{ subscriptionId, reason, cancelledAt }` | Analytics |
| **SubscriptionPaused** | 訂閱已暫停 | `{ subscriptionId, pausedUntil }` | BillingCalculator |

### 用戶旅程事件

| 事件名稱 | 觸發時機 | 資料負載 | 訂閱者 |
|---------|---------|---------|--------|
| **UserRegistered** | 用戶註冊成功 | `{ userId, email, source }` | Onboarding, Analytics |
| **UserAuthenticated** | 用戶登入成功 | `{ userId, sessionId, device }` | Session Manager |
| **OnboardingStarted** | 引導流程開始 | `{ userId, step: 1 }` | UI Layer |
| **OnboardingCompleted** | 引導流程完成 | `{ userId, completedAt }` | Achievement System |
| **AhaMomentReached** | Aha 時刻達成 | `{ userId, trigger: 'first_expense' }` | Retention Service |

### 智能分析流程

| 事件名稱 | 觸發時機 | 資料負載 | 訂閱者 |
|---------|---------|---------|--------|
| **MonthlyDataAggregated** | 月度資料彙總完成 | `{ userId, month, totalExpenses, byCategory }` | InsightsGenerator |
| **InsightsGenerated** | 洞察已生成 | `{ userId, insights[], generatedAt }` | User Notification |
| **AnomalyDetected** | 異常偵測到 | `{ userId, anomalyType, severity }` | Alert Service |
| **TrendIdentified** | 趨勢已識別 | `{ userId, trendType, direction }` | Recommendation Engine |

### 錯誤處理事件

| 事件名稱 | 觸發時機 | 資料負載 | 訂閱者 |
|---------|---------|---------|--------|
| **AIServiceFailed** | AI 服務失敗 | `{ error, input, timestamp }` | Monitoring, FallbackService |
| **FallbackModeActivated** | 降級模式啟動 | `{ reason, activatedAt }` | Monitoring, UI Layer |
| **RateLimitExceeded** | 速率限制超過 | `{ userId, limit, attemptedAt }` | User Notification |
| **SyncConflictDetected** | 同步衝突偵測 | `{ expenseId, serverVersion, clientVersion }` | Conflict Resolver |
| **NetworkErrorOccurred** | 網路錯誤發生 | `{ operation, error, retryCount }` | Retry Service |

---

## 🔵 命令 (Commands)

### 記帳命令

```typescript
// Command: ParseExpense
interface ParseExpenseCommand {
  text: string;
  userId: string;
  timezone?: string;
}
// 觸發事件: ExpenseInputReceived → ExpenseParsed

// Command: CreateExpense
interface CreateExpenseCommand {
  userId: string;
  amount: number;
  category: Category;
  description?: string;
  date: Date;
  aiConfidence?: number;
}
// 觸發事件: ExpenseCreated → CategorySuggested

// Command: CorrectCategory
interface CorrectCategoryCommand {
  expenseId: string;
  newCategory: Category;
  userId: string;
}
// 觸發事件: CategoryCorrected → AILearned

// Command: UpdateExpense
interface UpdateExpenseCommand {
  expenseId: string;
  updates: Partial<Expense>;
  expectedVersion?: number;
}
// 觸發事件: ExpenseUpdated → SyncConflictDetected (if version mismatch)

// Command: DeleteExpense
interface DeleteExpenseCommand {
  expenseId: string;
  userId: string;
}
// 觸發事件: ExpenseDeleted
```

### 訂閱命令

```typescript
// Command: AddSubscription
interface AddSubscriptionCommand {
  userId: string;
  name: string;
  amount: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  firstBillingDate: Date;
}
// 觸發事件: SubscriptionAdded → BillingDateCalculated → BillingReminderScheduled

// Command: CancelSubscription
interface CancelSubscriptionCommand {
  subscriptionId: string;
  reason?: string;
}
// 觸發事件: SubscriptionCancelled

// Command: CalculateNextBilling
interface CalculateNextBillingCommand {
  subscriptionId: string;
  currentBillingDate: Date;
}
// 觸發事件: BillingDateCalculated

// Command: SendBillingReminder
interface SendBillingReminderCommand {
  subscriptionId: string;
  daysAhead: number;
}
// 觸發事件: BillingReminderSent
```

### 用戶命令

```typescript
// Command: RegisterUser
interface RegisterUserCommand {
  email: string;
  provider: 'google' | 'email';
  providerId?: string;
}
// 觸發事件: UserRegistered → OnboardingStarted

// Command: CompleteOnboarding
interface CompleteOnboardingCommand {
  userId: string;
}
// 觸發事件: OnboardingCompleted → AhaMomentReached
```

### 分析命令

```typescript
// Command: GenerateMonthlyInsights
interface GenerateMonthlyInsightsCommand {
  userId: string;
  month: string; // YYYY-MM
}
// 觸發事件: MonthlyDataAggregated → InsightsGenerated

// Command: DetectAnomaly
interface DetectAnomalyCommand {
  userId: string;
  expenseId: string;
}
// 觸發事件: AnomalyDetected
```

---

## 🟡 聚合 (Aggregates)

### Expense Aggregate (支出聚合)

```typescript
class Expense {
  // 識別與基本資訊
  private id: string;
  private userId: string;
  private amount: Money;
  private category: Category;
  private description: string;
  private date: DateTime;

  // AI 相關
  private aiConfidence: number;
  private fallbackUsed: boolean;

  // 同步控制
  private version: number;
  private lastModifiedAt: DateTime;
  private lastModifiedDevice: string;
  private syncStatus: SyncStatus;

  // 審計
  private createdAt: DateTime;
  private updatedAt: DateTime;

  // ===== 行為方法 =====

  correctCategory(newCategory: Category): void {
    const oldCategory = this.category;
    this.category = newCategory;
    this.version++;
    this.updatedAt = DateTime.now();

    // 發布事件
    this.addDomainEvent(new CategoryCorrectedEvent({
      expenseId: this.id,
      oldCategory,
      newCategory,
      userId: this.userId
    }));
  }

  update(updates: Partial<ExpenseDTO>, expectedVersion?: number): void {
    // 樂觀鎖檢查
    if (expectedVersion && this.version !== expectedVersion) {
      throw new SyncConflictError({
        expenseId: this.id,
        expectedVersion,
        actualVersion: this.version
      });
    }

    Object.assign(this, updates);
    this.version++;
    this.lastModifiedAt = DateTime.now();

    this.addDomainEvent(new ExpenseUpdatedEvent({
      expenseId: this.id,
      updates
    }));
  }

  // 業務規則驗證
  validate(): ValidationResult {
    if (this.amount.value <= 0) {
      return ValidationResult.fail('INVALID_AMOUNT');
    }
    if (this.date.isAfter(DateTime.now())) {
      return ValidationResult.fail('FUTURE_DATE_NOT_ALLOWED');
    }
    return ValidationResult.success();
  }

  // 查詢方法
  isLowConfidence(): boolean {
    return this.aiConfidence < 80;
  }

  needsManualReview(): boolean {
    return this.fallbackUsed || this.isLowConfidence();
  }
}
```

### Subscription Aggregate (訂閱聚合)

```typescript
class Subscription {
  private id: string;
  private userId: string;
  private name: string;
  private amount: Money;
  private billingCycle: BillingCycle;
  private nextBillingDate: DateTime;
  private status: SubscriptionStatus;

  // 統計
  private totalPaid: Money;
  private billingCount: number;

  private createdAt: DateTime;
  private updatedAt: DateTime;

  // ===== 行為方法 =====

  calculateNextBilling(): DateTime {
    let nextDate: DateTime;

    if (this.billingCycle === BillingCycle.MONTHLY) {
      nextDate = this.nextBillingDate.plusMonths(1);

      // 處理月底邊界案例 (如 1/31 → 2/28)
      if (this.nextBillingDate.day > nextDate.daysInMonth) {
        nextDate = nextDate.withDay(nextDate.daysInMonth);
      }
    } else {
      nextDate = this.nextBillingDate.plusYears(1);

      // 處理閏年 (2/29 → 2/28)
      if (this.nextBillingDate.month === 2 && this.nextBillingDate.day === 29) {
        if (!nextDate.isLeapYear()) {
          nextDate = nextDate.withDay(28);
        }
      }
    }

    this.nextBillingDate = nextDate;
    this.updatedAt = DateTime.now();

    this.addDomainEvent(new BillingDateCalculatedEvent({
      subscriptionId: this.id,
      nextBillingDate: nextDate,
      daysUntil: nextDate.diff(DateTime.now(), 'days')
    }));

    return nextDate;
  }

  shouldSendReminder(daysAhead: number): boolean {
    const daysUntilBilling = this.nextBillingDate.diff(DateTime.now(), 'days');
    return daysUntilBilling === daysAhead && this.status === SubscriptionStatus.ACTIVE;
  }

  bill(): Expense {
    if (this.status !== SubscriptionStatus.ACTIVE) {
      throw new Error('Cannot bill inactive subscription');
    }

    this.totalPaid = this.totalPaid.add(this.amount);
    this.billingCount++;

    this.addDomainEvent(new SubscriptionBilledEvent({
      subscriptionId: this.id,
      amount: this.amount,
      date: DateTime.now()
    }));

    // 自動創建支出記錄
    const expense = Expense.createFromSubscription(this);

    this.addDomainEvent(new ExpenseAutoCreatedEvent({
      expenseId: expense.id,
      subscriptionId: this.id,
      amount: this.amount
    }));

    // 計算下次扣款日
    this.calculateNextBilling();

    return expense;
  }

  cancel(reason?: string): void {
    this.status = SubscriptionStatus.CANCELLED;
    this.updatedAt = DateTime.now();

    this.addDomainEvent(new SubscriptionCancelledEvent({
      subscriptionId: this.id,
      reason,
      cancelledAt: DateTime.now()
    }));
  }

  pause(until?: DateTime): void {
    this.status = SubscriptionStatus.PAUSED;
    this.addDomainEvent(new SubscriptionPausedEvent({
      subscriptionId: this.id,
      pausedUntil: until
    }));
  }

  getMonthlyEquivalent(): Money {
    if (this.billingCycle === BillingCycle.MONTHLY) {
      return this.amount;
    }
    return this.amount.divide(12);
  }
}
```

### User Aggregate (用戶聚合)

```typescript
class User {
  private id: string;
  private email: string;
  private telegramId?: string;
  private onboardingCompleted: boolean;
  private firstExpenseAt?: DateTime;
  private createdAt: DateTime;

  // ===== 行為方法 =====

  completeOnboarding(): void {
    this.onboardingCompleted = true;

    this.addDomainEvent(new OnboardingCompletedEvent({
      userId: this.id,
      completedAt: DateTime.now()
    }));
  }

  recordFirstExpense(): void {
    if (!this.firstExpenseAt) {
      this.firstExpenseAt = DateTime.now();

      this.addDomainEvent(new AhaMomentReachedEvent({
        userId: this.id,
        trigger: 'first_expense',
        reachedAt: DateTime.now()
      }));
    }
  }

  linkTelegram(telegramId: string): void {
    this.telegramId = telegramId;

    this.addDomainEvent(new TelegramLinkedEvent({
      userId: this.id,
      telegramId
    }));
  }

  hasReachedAhaMoment(): boolean {
    return this.firstExpenseAt !== undefined;
  }

  daysSinceRegistration(): number {
    return DateTime.now().diff(this.createdAt, 'days');
  }
}
```

---

## 🔄 事件流程圖

### 流程 1: 快速記帳 (核心場景)

```
┌─────────┐
│  用戶   │ 輸入 "早餐 65"
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ ParseExpenseCommand │
└─────────┬───────────┘
          │
          ▼
┌───────────────────────┐
│ ExpenseInputReceived  │ Event
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│  AIParserService      │ (Claude API)
└──────────┬────────────┘
           │
           ▼ (成功，500ms)
┌───────────────────────┐
│   ExpenseParsed       │ Event
│  {                    │
│    amount: 65,        │
│    category: "FOOD",  │
│    confidence: 95%    │
│  }                    │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│ CreateExpenseCommand  │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   ExpenseCreated      │ Event
└──────────┬────────────┘
           │
           ├──────────────┐
           │              │
           ▼              ▼
    ┌──────────┐   ┌──────────────┐
    │ Database │   │ Cache Service│
    │  Insert  │   │   儲存快取   │
    └──────────┘   └──────────────┘
           │
           ▼
    ┌──────────────────┐
    │  UI Notification │ "✨ 已記帳!"
    └──────────────────┘
```

### 流程 2: AI 分類修正與學習

```
┌─────────┐
│  用戶   │ 點擊錯誤記錄
└────┬────┘
     │
     ▼
┌──────────────────────┐
│  顯示編輯對話框      │
│  目前分類: 娛樂 ❌   │
└─────────┬────────────┘
          │
          ▼ (用戶選擇「交通」)
┌────────────────────────┐
│ CorrectCategoryCommand │
│ {                      │
│   expenseId: "xyz",    │
│   newCategory: "TRANSPORT"│
│ }                      │
└─────────┬──────────────┘
          │
          ▼
┌────────────────────────┐
│  CategoryCorrected     │ Event
└─────────┬──────────────┘
          │
          ├─────────────────┐
          │                 │
          ▼                 ▼
    ┌──────────┐     ┌──────────────┐
    │ Update   │     │ LearningService│
    │ Database │     │  儲存學習樣本  │
    └──────────┘     └───────┬────────┘
                             │
                             ▼
                     ┌──────────────┐
                     │  AILearned   │ Event
                     │ {            │
                     │  input: "Uber 回家 120",│
                     │  correctCategory: "TRANSPORT"│
                     │ }            │
                     └───────┬──────┘
                             │
                             ▼
                     ┌──────────────────┐
                     │  通知             │
                     │ "AI 會記住這個修正🧠"│
                     └──────────────────┘
```

### 流程 3: 訂閱提醒 (Cron Job)

```
┌─────────────┐
│  Cron Job   │ 每日 00:00 執行
└──────┬──────┘
       │
       ▼
┌────────────────────────────┐
│ 查詢即將扣款訂閱           │
│ WHERE nextBillingDate IN   │
│ (today+1, today+3)         │
└──────┬─────────────────────┘
       │
       ▼ (找到 Netflix, 3天後扣款)
┌────────────────────────────┐
│ SendBillingReminderCommand │
│ {                          │
│   subscriptionId: "abc",   │
│   daysAhead: 3             │
│ }                          │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────┐
│ BillingReminderSent        │ Event
└──────┬─────────────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌────────────┐   ┌─────────────────┐
│ Push       │   │ Email Service   │
│ Notification│   │                 │
│ "Netflix   │   │ 主題: 即將扣款  │
│ 將在3天後  │   │ 內容: Netflix...│
│ 扣款 $390" │   └─────────────────┘
└────────────┘
```

### 流程 4: 訂閱自動扣款

```
┌─────────────┐
│  Cron Job   │ 每日檢查
└──────┬──────┘
       │
       ▼
┌────────────────────────────┐
│ 查詢今日扣款訂閱           │
│ WHERE nextBillingDate =    │
│ CURRENT_DATE               │
└──────┬─────────────────────┘
       │
       ▼ (找到 Spotify, 今天扣款)
┌────────────────────────────┐
│ Subscription.bill()        │ 領域邏輯
└──────┬─────────────────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌────────────────┐   ┌────────────────────┐
│SubscriptionBilled│ │ExpenseAutoCreated  │
│ Event          │   │ Event              │
└────┬───────────┘   └─────┬──────────────┘
     │                     │
     ▼                     ▼
┌─────────────────┐   ┌────────────────────┐
│CalculateNextBilling│ │ 插入 Expense       │
│ (下個月同日)    │   │ {                  │
└─────┬───────────┘   │   description:     │
      │               │   "Spotify(自動)"  │
      ▼               │ }                  │
┌─────────────────┐   └────────────────────┘
│ BillingDateCalculated│
│ Event           │
└─────┬───────────┘
      │
      ▼
┌─────────────────────┐
│ 通知                │
│ "已自動記錄         │
│  Spotify $149"      │
└─────────────────────┘
```

### 流程 5: AI 服務降級

```
┌─────────┐
│  用戶   │ ParseExpense
└────┬────┘
     │
     ▼
┌──────────────────┐
│ AIParserService  │ 呼叫 Claude API
└────┬─────────────┘
     │
     ▼ (10秒超時 / 503 錯誤)
┌──────────────────┐
│ AIServiceFailed  │ Event
└────┬─────────────┘
     │
     ▼
┌────────────────────┐
│FallbackModeActivated│ Event
└────┬───────────────┘
     │
     ├────────────────────┐
     │                    │
     ▼                    ▼
┌──────────────┐   ┌──────────────┐
│ Rule Engine  │   │ 記錄監控事件 │
│ 規則解析     │   │ (Sentry)     │
└────┬─────────┘   └──────────────┘
     │
     ▼
┌──────────────────┐
│ ExpenseParsed    │ Event
│ {                │
│   amount: 65,    │
│   category: "FOOD",│
│   confidence: 70%,│
│   fallbackUsed: true│
│ }                │
└────┬─────────────┘
     │
     ▼
┌──────────────────────┐
│ 通知                 │
│ "AI 暫時休息中，     │
│  已切換基本模式"     │
└──────────────────────┘
```

---

## 🏛️ 邊界上下文 (Bounded Contexts)

### 上下文全景圖

```
┌─────────────────────────────────────────────────────────┐
│                    QuickSmart 系統                       │
│                                                          │
│  ┌───────────────────┐     ┌──────────────────┐        │
│  │ Expense Tracking  │────▶│   Analytics      │        │
│  │   (支出追蹤)      │     │   (分析洞察)     │        │
│  │                   │     │                  │        │
│  │ - AI 解析         │     │ - 趨勢分析       │        │
│  │ - 分類管理        │     │ - AI 洞察        │        │
│  │ - CRUD            │     │ - 異常偵測       │        │
│  └─────────┬─────────┘     └──────────────────┘        │
│            │                                             │
│            │ userId                                      │
│            ▼                                             │
│  ┌───────────────────┐     ┌──────────────────┐        │
│  │ User Identity     │     │ Subscription     │        │
│  │   (用戶身份)      │     │  (訂閱管理)      │        │
│  │                   │     │                  │        │
│  │ - 認證            │     │ - 扣款計算       │        │
│  │ - Onboarding      │     │ - 提醒排程       │        │
│  └───────────────────┘     └────────┬─────────┘        │
│                                      │                   │
│                                      │ auto-create       │
│                                      ▼                   │
│                          ┌────────────────────┐         │
│                          │   Notification     │         │
│                          │     (通知)         │         │
│                          │                    │         │
│  ┌───────────────────┐  │ - Push             │         │
│  │      Sync         │  │ - Email            │         │
│  │  (多設備同步)     │  │ - Telegram         │         │
│  │                   │  └────────────────────┘         │
│  │ - 衝突解決        │                                  │
│  │ - 版本控制        │                                  │
│  └───────────────────┘                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1. Expense Tracking Context (支出追蹤)

**職責**: 記帳輸入、AI 解析、分類管理、支出 CRUD

**核心概念**:
- Aggregates: `Expense`
- Value Objects: `Money`, `Category`
- Services: `AIParserService`, `CategoryClassifier`, `FallbackParser`
- Repositories: `ExpenseRepository`

**領域事件**:
- `ExpenseInputReceived`
- `ExpenseParsed`
- `ExpenseCreated`
- `CategoryCorrected`
- `AILearned`

**業務規則**:
1. 金額必須 > 0
2. 日期不能是未來
3. AI 信心度 < 50% 時需要用戶確認
4. 降級模式時 confidence = 70%

**對外接口**:
```typescript
interface ExpenseTrackingAPI {
  parseExpense(input: string): Promise<ParsedExpense>;
  createExpense(data: CreateExpenseDTO): Promise<Expense>;
  correctCategory(expenseId: string, category: Category): Promise<void>;
  getExpenses(filters: ExpenseFilters): Promise<Expense[]>;
}
```

---

### 2. Subscription Management Context (訂閱管理)

**職責**: 訂閱 CRUD、扣款日計算、提醒排程、自動記帳

**核心概念**:
- Aggregates: `Subscription`
- Value Objects: `BillingCycle`, `SubscriptionStatus`
- Services: `BillingCalculator`, `ReminderScheduler`
- Repositories: `SubscriptionRepository`

**領域事件**:
- `SubscriptionAdded`
- `BillingDateCalculated`
- `BillingReminderSent`
- `SubscriptionBilled`
- `ExpenseAutoCreated`

**業務規則**:
1. 月底日期處理：1/31 → 2/28 (非閏年)
2. 閏年處理：2024/2/29 → 2025/2/28
3. 提醒時機：扣款前 3 天、1 天、當天
4. 自動記帳：扣款當天創建 Expense

**對外接口**:
```typescript
interface SubscriptionAPI {
  addSubscription(data: CreateSubscriptionDTO): Promise<Subscription>;
  calculateNextBilling(subscriptionId: string): Promise<DateTime>;
  sendReminder(subscriptionId: string, daysAhead: number): Promise<void>;
  getUpcomingBillings(days: number): Promise<Subscription[]>;
}
```

---

### 3. User Identity Context (用戶身份)

**職責**: 認證、註冊、Onboarding、用戶資料管理

**核心概念**:
- Aggregates: `User`
- Services: `AuthService`, `OnboardingService`
- Repositories: `UserRepository`

**領域事件**:
- `UserRegistered`
- `UserAuthenticated`
- `OnboardingCompleted`
- `AhaMomentReached`
- `TelegramLinked`

**業務規則**:
1. Email 唯一性
2. Telegram ID 唯一性
3. Onboarding 必須完成才能使用完整功能

**對外接口**:
```typescript
interface UserIdentityAPI {
  register(email: string, provider: string): Promise<User>;
  authenticate(credentials: Credentials): Promise<Session>;
  completeOnboarding(userId: string): Promise<void>;
  linkTelegram(userId: string, telegramId: string): Promise<void>;
}
```

---

### 4. Analytics Context (分析洞察)

**職責**: 資料彙總、趨勢分析、AI 洞察生成、異常偵測

**核心概念**:
- Services: `InsightsGenerator`, `TrendAnalyzer`, `AnomalyDetector`
- Read Models: `MonthlyAggregation`, `CategoryTrend`

**領域事件**:
- `MonthlyDataAggregated`
- `InsightsGenerated`
- `TrendIdentified`
- `AnomalyDetected`

**業務規則**:
1. 至少 30 天資料才能生成洞察
2. 異常定義：單筆支出 > 月平均 3 倍
3. 趨勢分析：比較最近 3 個月

**對外接口**:
```typescript
interface AnalyticsAPI {
  generateMonthlyInsights(userId: string, month: string): Promise<Insights>;
  analyzeTrend(userId: string, category: Category): Promise<Trend>;
  detectAnomalies(userId: string): Promise<Anomaly[]>;
}
```

---

### 5. Notification Context (通知)

**職責**: 推播通知、Email、Telegram 訊息發送

**核心概念**:
- Services: `PushNotificationService`, `EmailService`, `TelegramBotService`

**領域事件**:
- `NotificationSent`
- `NotificationFailed`

**對外接口**:
```typescript
interface NotificationAPI {
  sendPush(userId: string, message: string): Promise<void>;
  sendEmail(email: string, subject: string, body: string): Promise<void>;
  sendTelegram(telegramId: string, message: string): Promise<void>;
}
```

---

### 6. Sync Context (多設備同步)

**職責**: 衝突偵測、版本控制、衝突解決

**核心概念**:
- Services: `SyncService`, `ConflictResolver`

**領域事件**:
- `SyncConflictDetected`
- `ConflictResolved`

**業務規則**:
1. 樂觀鎖：version 欄位檢查
2. Last-Write-Wins (MVP 簡化方案)
3. 5 分鐘內的修改提示重新載入

**對外接口**:
```typescript
interface SyncAPI {
  updateExpense(expenseId: string, data: UpdateDTO, expectedVersion: number): Promise<Expense>;
  resolveConflict(expenseId: string, strategy: ConflictStrategy): Promise<Expense>;
}
```

---

## 🔗 上下文映射 (Context Mapping)

### 映射關係圖

```
┌──────────────────┐
│ Expense Tracking │
└────────┬─────────┘
         │
         │ Shared Kernel
         ▼ (共享 Expense 實體)
┌──────────────────┐
│    Analytics     │
└──────────────────┘


┌──────────────────┐
│   Subscription   │
└────────┬─────────┘
         │
         │ Customer/Supplier
         │ (Subscription 創建 Expense)
         ▼
┌──────────────────┐
│ Expense Tracking │
└──────────────────┘


┌──────────────────┐
│  User Identity   │
└────────┬─────────┘
         │
         │ Conformist
         │ (提供 userId)
         ▼
┌──────────────────┐
│ Expense Tracking │
└──────────────────┘


┌──────────────────┐
│  Notification    │◀─────────────┐
└──────────────────┘              │
         ▲                         │
         │ Open Host Service      │
         │ (提供通知 API)         │
         │                         │
    ┌────┴────┬────────────┬──────┴──┐
    │         │            │         │
┌───┴───┐ ┌──┴──┐ ┌───────┴────┐ ┌─┴────┐
│Expense│ │Sub- │ │  Analytics │ │ Sync │
│Tracking│ │scription│ └────────────┘ └──────┘
└───────┘ └─────┘


┌──────────────────┐
│      Sync        │
└────────┬─────────┘
         │
         │ Anti-Corruption Layer
         │ (保護核心領域)
         ▼
┌──────────────────┐
│ Expense Tracking │
└──────────────────┘
```

### 映射模式說明

**1. Shared Kernel (共享核心)**
- **關係**: `Expense Tracking` ↔ `Analytics`
- **共享內容**: `Expense` 實體、`Category` 枚舉
- **協作方式**: 雙方共同維護，需協商變更
- **測試策略**: Integration Test 驗證兼容性

**2. Customer/Supplier (客戶/供應商)**
- **關係**: `Subscription` → `Expense Tracking`
- **依賴方向**: Subscription 依賴 Expense Tracking 的 API
- **契約**: `ExpenseAutoCreated` 事件
- **測試策略**: Contract Test

**3. Conformist (遵奉者)**
- **關係**: `User Identity` → `All Contexts`
- **依賴方向**: 所有上下文依賴 `userId`
- **協作方式**: 其他上下文遵從 User Identity 的模型
- **測試策略**: Mock User Service

**4. Open Host Service (開放主機服務)**
- **關係**: `Notification` ← `All Contexts`
- **提供內容**: 統一的通知 API
- **協作方式**: 發布明確的 API 規範
- **測試策略**: API Contract Test

**5. Anti-Corruption Layer (防腐層)**
- **關係**: `Sync` → `Expense Tracking`
- **保護目標**: 避免同步邏輯污染核心領域
- **實現方式**: SyncService 作為適配器
- **測試策略**: Integration Test

---

## 🔥 熱點與風險

### 熱點 (Hotspots) - 需要重點關注的複雜區域

#### 1. AI 解析與降級機制 ⚠️⚠️⚠️

**複雜度**: 高
**影響範圍**: Expense Tracking Context

**問題點**:
- Claude API 失效時的無感降級
- 規則引擎準確率 vs AI 準確率差異
- 快取策略避免重複呼叫

**緩解策略**:
- ✅ 完整的 Fallback 測試 (Unit + Integration)
- ✅ 監控降級模式使用率
- ✅ 定期更新規則引擎規則

**測試覆蓋**:
```typescript
// __tests__/integration/ai-fallback.spec.ts
describe('AI Fallback Mechanism', () => {
  it('應在 API 失效時自動切換到規則引擎', async () => {
    mockClaudeAPI.simulateFailure();
    const result = await parseExpense('早餐 65');
    expect(result.fallbackUsed).toBe(true);
    expect(result.confidence).toBeLessThan(80);
  });

  it('應記錄降級事件到監控系統', async () => {
    // ...驗證 Sentry 事件
  });
});
```

---

#### 2. 訂閱扣款日計算 ⚠️⚠️

**複雜度**: 中高
**影響範圍**: Subscription Context

**問題點**:
- 閏年處理 (2/29 → 2/28)
- 月底邊界 (1/31 → 2/28)
- 跨年計算

**緩解策略**:
- ✅ Specification by Example (20+ 邊界案例)
- ✅ 使用 date-fns 等成熟庫
- ✅ 100% 測試覆蓋率

**測試覆蓋**:
```typescript
// __tests__/unit/calculateNextBilling.spec.ts
const examples = [
  { cycle: 'MONTHLY', last: '2024-01-31', expected: '2024-02-29' }, // 閏年
  { cycle: 'MONTHLY', last: '2025-01-31', expected: '2025-02-28' }, // 非閏年
  { cycle: 'YEARLY', last: '2024-02-29', expected: '2025-02-28' },  // 閏年跨年
];

test.each(examples)('should calculate $expected', ({ cycle, last, expected }) => {
  // ...測試實現
});
```

---

#### 3. 多設備同步衝突 ⚠️⚠️

**複雜度**: 中
**影響範圍**: Sync Context

**問題點**:
- 兩個裝置同時修改同一筆記錄
- 網路延遲導致的版本衝突
- 用戶體驗設計（如何呈現衝突）

**緩解策略**:
- ✅ MVP 採用 Last-Write-Wins 簡化
- ✅ V1.1 才實作完整樂觀鎖
- ✅ 5 分鐘內修改提示重新載入

**測試覆蓋**:
```typescript
// __tests__/integration/sync-conflict.spec.ts
describe('Sync Conflict Detection', () => {
  it('應偵測版本衝突', async () => {
    const expense = await createTestExpense({ version: 1 });

    // 模擬兩個裝置同時修改
    const update1 = updateExpense(expense.id, { amount: 100 }, 1);
    const update2 = updateExpense(expense.id, { amount: 200 }, 1);

    await expect(Promise.all([update1, update2])).rejects.toThrow('SYNC_CONFLICT');
  });
});
```

---

### 風險評估矩陣

| 風險項目 | 可能性 | 影響 | 風險等級 | 緩解策略 | 測試覆蓋 |
|---------|--------|------|----------|----------|----------|
| Claude API 成本超標 | 中 | 高 | 🔴 高 | Rate Limit + 快取 | Integration Test |
| AI 準確率 < 85% | 低 | 高 | 🟡 中 | 持續學習 + 規則引擎 | SDD 50+ 範例 |
| 訂閱計算錯誤 | 低 | 中 | 🟡 中 | SDD 邊界案例 | 100% Coverage |
| 同步衝突頻繁 | 中 | 中 | 🟡 中 | Last-Write-Wins | Integration Test |
| Onboarding 轉化率低 | 高 | 中 | 🟡 中 | A/B Test | E2E Test |
| 資料庫效能瓶頸 | 低 | 低 | 🟢 低 | 索引優化 | Load Test |

---

## 📊 Event Storming 實踐建議

### 1. 團隊工作坊流程

**準備階段** (1 小時)
- 準備便利貼：橙色(事件)、藍色(命令)、黃色(聚合)
- 準備白板或 Miro 線上協作板
- 邀請：PM、工程師、UX、QA

**階段 1: Big Picture** (1.5 小時)
1. 按時間線貼出所有領域事件 (橙色便利貼)
2. 不討論細節，快速腦暴
3. 群組相關事件

**階段 2: Process Modeling** (2 小時)
1. 為每個事件找出觸發命令 (藍色便利貼)
2. 識別聚合根 (黃色便利貼)
3. 標記熱點 (紅色圈圈)

**階段 3: 軟體設計** (1 小時)
1. 劃分邊界上下文
2. 定義上下文映射關係
3. 討論技術實現方案

---

### 2. 持續演進機制

**每 Sprint**:
- 新功能開發前，更新 Event Storming 圖
- 發現新的領域事件立即補充

**每季度**:
- 重新審視邊界上下文劃分
- 評估是否需要拆分/合併上下文

**變更管理**:
- 事件/命令變更需經過團隊 Review
- 重大架構變更需更新此文件

---

### 3. 與測試策略的連接

**從事件到測試**:

```
領域事件 → 測試案例

ExpenseParsed →
  - Unit Test: parseExpense() 函數
  - Integration Test: POST /api/expenses/parse
  - E2E Test: 完整記帳流程

BillingDateCalculated →
  - Unit Test: calculateNextBilling() 函數 (SDD 邊界案例)
  - Integration Test: Cron Job 執行

SyncConflictDetected →
  - Integration Test: 樂觀鎖檢查
  - E2E Test: 多裝置同步場景
```

---

## 🎯 總結與下一步

### Event Storming 核心發現

1. **6 個清晰的邊界上下文**
   - Expense Tracking (核心)
   - Subscription Management
   - User Identity
   - Analytics
   - Notification (基礎設施)
   - Sync (基礎設施)

2. **3 個關鍵聚合**
   - `Expense`: 支出實體，包含 AI 信心度、版本控制
   - `Subscription`: 訂閱實體，負責扣款計算
   - `User`: 用戶實體，追蹤 Aha Moment

3. **3 個熱點區域需重點測試**
   - AI 解析與降級機制
   - 訂閱扣款日計算
   - 多設備同步衝突

### 下一步行動

**立即執行**:
1. ✅ 將此文件加入版本控制
2. ✅ 分享給全團隊 Review
3. ✅ 根據邊界上下文調整專案資料夾結構

**Week 1-2**:
1. 根據 Event Storming 結果設計資料庫 Schema
2. 實作核心聚合類別 (TDD)
3. 設定事件匯流排 (EventEmitter / Message Queue)

**持續優化**:
1. 每次 Sprint Review 後更新事件流程圖
2. 新功能開發前先更新 Event Storming
3. 定期檢視熱點區域的測試覆蓋率

---

**文件維護**:
- 當新增/修改領域事件時，更新此文件
- 當調整邊界上下文時，通知全團隊
- 每季度重新審視上下文映射關係

**版本**: v1.0
**最後更新**: 2025-10-20
**下次審查**: 2025-11-20
