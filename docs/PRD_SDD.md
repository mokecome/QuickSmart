# QuickSmart 智慧記帳 Web App - PRD (Specification Driven Development 版)

## 文件資訊
- **版本**: v3.0 (SDD 優化版)
- **最後更新**: 2025-10-20
- **開發方法**: Specification by Example + TDD + BDD
- **維護者**: 產品經理 + 技術團隊

---

## 產品概述

### 背景資訊
- **目標用戶**: 懶得記帳但想理財的年輕人（22-35歲）
- **核心痛點**: 傳統記帳 App 操作繁瑣，導致半途而廢
- **競品問題**: 功能太多、分類太細、操作步驟太多

### 產品定位
- **一句話描述**: 最適合懶人的智慧記帳工具
- **核心價值**: 用 AI 降低記帳摩擦力

### 功能範圍
1. 快速記帳（自然語言輸入）
2. 訂閱管理（固定支出）
3. 智慧分析（AI 洞察）
4. 擴充能力（Telegram、MCP）

---

## 1️⃣ 核心規格定義（Specification by Example）

### 1.1 自然語言記帳解析規格

#### API Contract Specification

```typescript
// API Endpoint: POST /api/expenses/parse
// Purpose: 解析自然語言輸入，返回結構化支出資料

interface ParseExpenseRequest {
  text: string;        // 用戶輸入的自然語言
  userId: string;      // 用戶 ID（從 Session 取得）
  timezone?: string;   // 時區（預設 Asia/Taipei）
}

interface ParseExpenseResponse {
  amount: number;           // 金額（必填）
  category: Category;       // 分類（必填）
  description: string;      // 描述（可選）
  date: string;            // ISO8601 格式（必填）
  confidence: number;      // AI 信心度 0-100
  fallbackUsed: boolean;   // 是否使用降級模式
  suggestions?: string[];  // AI 建議的修正選項
}

enum Category {
  FOOD = "餐飲",
  TRANSPORT = "交通",
  ENTERTAINMENT = "娛樂",
  SHOPPING = "購物",
  HOUSING = "居住",
  MEDICAL = "醫療",
  EDUCATION = "教育",
  SUBSCRIPTION = "訂閱",
  OTHER = "其他",
  INCOME = "收入"
}
```

#### Specification by Example - 基本解析

| 輸入範例 | 預期輸出 | 信心度 | 備註 |
|---------|---------|-------|------|
| `早餐 65` | `{amount: 65, category: "FOOD", description: "早餐", date: "today", confidence: 95}` | 高 | 標準格式 |
| `午餐120` | `{amount: 120, category: "FOOD", description: "午餐", date: "today", confidence: 95}` | 高 | 無空格也能解析 |
| `星巴克拿鐵 150` | `{amount: 150, category: "FOOD", description: "星巴克拿鐵", date: "today", confidence: 98}` | 高 | 品牌識別 |
| `昨天晚餐 350` | `{amount: 350, category: "FOOD", description: "晚餐", date: "yesterday", confidence: 92}` | 高 | 相對日期 |
| `2025-01-15 電影票 320` | `{amount: 320, category: "ENTERTAINMENT", description: "電影票", date: "2025-01-15", confidence: 94}` | 高 | 絕對日期 |
| `Netflix 390` | `{amount: 390, category: "SUBSCRIPTION", description: "Netflix", date: "today", confidence: 99}` | 高 | 訂閱服務 |
| `Uber 回家 120` | `{amount: 120, category: "TRANSPORT", description: "Uber 回家", date: "today", confidence: 96}` | 高 | 多詞描述 |
| `薪水 45000` | `{amount: 45000, category: "INCOME", description: "薪水", date: "today", confidence: 90}` | 高 | 收入類型 |

#### Specification by Example - 邊界案例

| 輸入範例 | 預期輸出 | HTTP 狀態碼 | 錯誤代碼 |
|---------|---------|-----------|---------|
| `早餐` | `{error: "MISSING_AMOUNT"}` | 400 | `MISSING_AMOUNT` |
| `早餐 0` | `{error: "INVALID_AMOUNT"}` | 400 | `INVALID_AMOUNT` |
| `早餐 -50` | `{error: "INVALID_AMOUNT"}` | 400 | `INVALID_AMOUNT` |
| `早餐 999999999` | `{amount: 999999999, category: "OTHER", confidence: 30}` | 200 | 警告：金額異常大 |
| `asdfjkl 123` | `{amount: 123, category: "OTHER", confidence: 20}` | 200 | 低信心度需確認 |
| `` (空字串) | `{error: "EMPTY_INPUT"}` | 400 | `EMPTY_INPUT` |
| `早餐 65` (重複3次) | 使用快取，不重複呼叫 AI | 200 | - |
| 超過 500 字 | `{error: "INPUT_TOO_LONG"}` | 400 | `INPUT_TOO_LONG` |

#### Specification by Example - 日期解析

| 輸入 | 解析結果 | 測試場景 |
|-----|---------|---------|
| `今天` | 當前日期 | 預設值 |
| `昨天` | 當前日期 - 1 天 | 相對日期 |
| `前天` | 當前日期 - 2 天 | 相對日期 |
| `上週一` | 上週的星期一 | 相對日期 |
| `1/15` | 當年 1 月 15 日 | 簡短日期 |
| `2025-01-15` | 2025 年 1 月 15 日 | ISO 格式 |
| `明天` | 拒絕（不能記未來帳） | 錯誤處理 |
| `2026-12-31` | 拒絕（超過當年） | 錯誤處理 |

#### Specification by Example - 分類準確性

**餐飲類 (FOOD)**
```
輸入: 早餐、午餐、晚餐、宵夜、下午茶
輸入: 星巴克、麥當勞、肯德基、85度C、路易莎
輸入: 便當、火鍋、燒烤、拉麵、披薩
預期分類: FOOD
預期信心度: ≥ 90%
```

**交通類 (TRANSPORT)**
```
輸入: Uber、計程車、捷運、公車、高鐵、台鐵
輸入: 加油、停車費、過路費
預期分類: TRANSPORT
預期信心度: ≥ 90%
```

**訂閱類 (SUBSCRIPTION)**
```
輸入: Netflix、Spotify、Disney+、YouTube Premium
輸入: ChatGPT Plus、iCloud、健身房月費
預期分類: SUBSCRIPTION
預期信心度: ≥ 95%
```

**娛樂類 (ENTERTAINMENT)**
```
輸入: 電影票、KTV、遊戲、演唱會、主題樂園
預期分類: ENTERTAINMENT
預期信心度: ≥ 88%
```

### 1.2 訂閱管理規格

#### API Contract Specification

```typescript
// API Endpoint: POST /api/subscriptions
interface CreateSubscriptionRequest {
  name: string;                    // 訂閱名稱
  amount: number;                  // 金額
  billingCycle: 'MONTHLY' | 'YEARLY';
  firstBillingDate: string;        // ISO8601
  category?: Category;             // 可選，預設 SUBSCRIPTION
}

interface SubscriptionResponse {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  nextBillingDate: string;         // ISO8601
  status: 'ACTIVE' | 'CANCELLED' | 'PAUSED';
  daysUntilBilling: number;        // 距離下次扣款天數
  totalPaid: number;               // 累積已付金額
}
```

#### Specification by Example - 下次扣款日計算

| 訂閱週期 | 上次扣款日 | 預期下次扣款日 | 測試場景 |
|---------|-----------|--------------|---------|
| MONTHLY | 2025-01-15 | 2025-02-15 | 標準月份 |
| MONTHLY | 2025-01-31 | 2025-02-28 | 短月份調整 (非閏年) |
| MONTHLY | 2024-01-31 | 2024-02-29 | 短月份調整 (閏年) |
| MONTHLY | 2025-02-28 | 2025-03-28 | 從短月份恢復 |
| YEARLY | 2024-02-29 | 2025-02-28 | 閏年跨年 |
| YEARLY | 2025-01-15 | 2026-01-15 | 標準年度 |

#### Specification by Example - 提醒通知規則

| 距離扣款天數 | 是否發送通知 | 通知內容範例 | 通知渠道 |
|-----------|------------|------------|---------|
| 3 天 | ✅ 是 | "Netflix 將在 3 天後扣款 $390" | Push + Email |
| 1 天 | ✅ 是 | "明天將扣款：Spotify $149" | Push + Email |
| 0 天 | ✅ 是 | "今天扣款：健身房 $1,200" | Push |
| 7 天 | ❌ 否 | - | - |
| 已取消 | ❌ 否 | - | - |

#### Specification by Example - 月度總額計算

| 用戶訂閱清單 | 預期月度總額 | 計算邏輯 |
|-----------|------------|---------|
| Netflix $390/月 + Spotify $149/月 | $539 | 標準計算 |
| Disney+ $270/月 + iCloud $900/年 | $345 | 年費 ÷ 12 |
| ChatGPT $660/月 (已取消) | $0 | 排除已取消 |
| 健身房 $1,200/月 (暫停) | $0 | 排除已暫停 |

### 1.3 UI 互動規格

#### Specification by Example - 輸入框行為

| 用戶操作 | 系統回應 | 視覺反饋 | 時間限制 |
|---------|---------|---------|---------|
| 輸入「早餐 65」+ Enter | 顯示成功訊息 + 清空輸入框 | 綠色勾勾動畫 | < 1 秒 |
| 輸入「早餐」(無金額) + Enter | 顯示錯誤提示：「忘記填金額了嗎?」 | 紅色底線 | 即時 |
| 輸入中 (未完成) | 顯示 AI 建議（下拉選單） | 淡入動畫 | < 300ms |
| 連續輸入 3 筆 | 第 3 筆後顯示鼓勵訊息：「太棒了！」 | 彩帶動畫 | - |
| 離開頁面 (未儲存) | 彈出確認對話框：「有未儲存的記帳」 | Modal | - |

#### Specification by Example - 分類修正流程

```gherkin
Scenario: 用戶修正 AI 錯誤分類
  Given 我有一筆記錄「Uber 120」被誤判為「娛樂」
  When 我點擊該記錄
  Then 應顯示編輯對話框，包含所有分類選項

  When 我選擇「交通」分類
  And 我點擊「儲存」按鈕
  Then 記錄應更新為「交通」分類
  And 應顯示成功訊息：「已更新！AI 會記住這個修正」

  When 我下次輸入「Uber 150」
  Then AI 應建議「交通」分類，信心度 ≥ 92%
```

### 1.4 效能規格

#### Specification by Example - 回應時間

| API 端點 | P50 | P95 | P99 | 測試方式 |
|---------|-----|-----|-----|---------|
| POST /api/expenses/parse | < 500ms | < 1s | < 2s | Load Test |
| GET /api/expenses?month=current | < 200ms | < 500ms | < 1s | Integration Test |
| POST /api/subscriptions | < 300ms | < 600ms | < 1s | Integration Test |
| GET /api/insights/monthly | < 2s | < 5s | < 10s | Integration Test |

#### Specification by Example - 並發處理

| 並發請求數 | 成功率 | 平均回應時間 | 錯誤率 |
|-----------|-------|------------|-------|
| 10 req/s | 100% | < 800ms | 0% |
| 50 req/s | 99.9% | < 1.2s | < 0.1% |
| 100 req/s | 99% | < 2s | < 1% |
| 200 req/s | 95% | < 5s | < 5% |

#### Specification by Example - 快取策略

| 資料類型 | 快取時間 | 失效條件 | 驗證方式 |
|---------|---------|---------|---------|
| AI 解析結果 (相同輸入) | 24 小時 | 用戶手動修正 | Unit Test |
| 月度支出統計 | 1 小時 | 新增/修改記錄 | Integration Test |
| 用戶分類偏好 | 永久 | 用戶修正分類 | Unit Test |
| 訂閱下次扣款日 | 每日 00:00 更新 | 用戶修改訂閱 | Cron Job Test |

### 1.5 錯誤處理規格

#### Specification by Example - 錯誤訊息對照表

| 錯誤代碼 | HTTP 狀態 | 用戶友善訊息 | 技術訊息 (Log) | 重試策略 |
|---------|----------|------------|--------------|---------|
| `MISSING_AMOUNT` | 400 | "忘記填金額了嗎？試試看「午餐 120」" | "Amount not found in input" | 不重試 |
| `INVALID_AMOUNT` | 400 | "金額好像怪怪的，必須大於 0 喔！" | "Amount must be > 0" | 不重試 |
| `AI_SERVICE_UNAVAILABLE` | 503 | "AI 小幫手暫時休息中，已切換到基本模式" | "Claude API timeout after 10s" | 自動降級 |
| `AI_RATE_LIMIT` | 429 | "今天記帳次數已達上限 (20 次)" | "User exceeded daily quota" | 明天重試 |
| `NETWORK_ERROR` | 0 | "網路似乎不太穩定，請檢查連線" | "Network request failed" | 自動重試 3 次 |
| `UNAUTHORIZED` | 401 | "登入狀態已過期，請重新登入" | "JWT token expired" | 導向登入頁 |
| `SYNC_CONFLICT` | 409 | "資料已在其他裝置更新，要重新載入嗎？" | "Version conflict detected" | 用戶選擇 |

#### Specification by Example - 降級模式行為

```typescript
// 當 Claude API 失效時的行為規格

Scenario: AI API 完全失效
  Given Claude API 返回 503 錯誤
  When 用戶輸入「早餐 65」
  Then 系統應切換到規則引擎
  And 應返回 {category: "FOOD", amount: 65, confidence: 70, fallbackUsed: true}
  And 應顯示提示：「目前使用基本模式，AI 恢復後會更準確」

Scenario: AI API 速率限制
  Given 用戶今天已記帳 20 次
  When 用戶嘗試第 21 次記帳
  Then 應返回 429 錯誤
  And 應顯示：「今天記帳次數已達上限，明天再來吧！」
  And 應提供手動選擇分類選項

Scenario: AI API 部分失效（超時）
  Given Claude API 回應時間 > 10 秒
  When 用戶輸入「星巴克 150」
  Then 應在 5 秒後自動切換到規則引擎
  And 應記錄降級事件到監控系統
  And 用戶不應感知到差異（無感降級）
```

### 1.6 資料驗證規格

#### Specification by Example - 金額驗證

| 輸入金額 | 是否通過 | 錯誤訊息 | 規則 |
|---------|---------|---------|------|
| `65` | ✅ | - | 正常金額 |
| `0` | ❌ | "金額必須大於 0" | amount > 0 |
| `-50` | ❌ | "金額不能為負數" | amount > 0 |
| `0.5` | ✅ | - | 支援小數 |
| `65.123` | ✅ (四捨五入 65.12) | - | 最多 2 位小數 |
| `999999` | ⚠️ | "金額異常大，請確認" | 警告但允許 |
| `10000000` | ❌ | "金額超過上限 (9,999,999)" | amount < 10,000,000 |

#### Specification by Example - 描述驗證

| 輸入描述 | 是否通過 | 處理方式 |
|---------|---------|---------|
| `早餐` | ✅ | 直接使用 |
| `星巴克拿鐵咖啡加燕麥奶` | ✅ | 直接使用 |
| 500 字超長描述 | ❌ | 截斷至 200 字 + 警告 |
| `<script>alert('xss')</script>` | ✅ | HTML 跳脫後儲存 |
| Emoji `☕️🍔` | ✅ | 保留 Emoji |

#### Specification by Example - 日期驗證

| 輸入日期 | 是否通過 | 錯誤訊息 |
|---------|---------|---------|
| `2025-01-15` | ✅ | - |
| `2025-02-30` | ❌ | "日期不存在" |
| `2026-01-01` | ❌ | "不能記未來的帳" |
| `2020-01-01` | ⚠️ | "這是 5 年前的記錄，確定嗎？" |
| `昨天` | ✅ | 自動轉換 |
| `明天` | ❌ | "不能記未來的帳" |

---

## 2️⃣ 核心用戶旅程（BDD 格式）

### 場景 1: 新用戶首次記帳（Aha Moment）

```gherkin
Feature: 新用戶 Onboarding 與首次記帳
  作為一個懶得記帳的用戶
  我想要快速體驗到 AI 記帳的便利性
  這樣我就能理解產品價值並持續使用

Background:
  Given 資料庫已清空
  And 測試伺服器已啟動
  And 我打開 https://quicksmart.app

Scenario: 完整 Onboarding 流程
  When 我點擊「使用 Google 登入」按鈕
  Then 我應該被導向 Google OAuth 頁面

  When 我完成 Google 認證
  Then 我應該返回 QuickSmart 首頁
  And 我應該看到歡迎訊息：「嗨 {name}，開始記第一筆帳吧！」
  And 我應該看到引導提示：「試試看輸入『早餐 65』」

Scenario: Aha Moment - 首次 AI 記帳成功
  Given 我已完成登入
  When 我在輸入框輸入「早餐 65」
  And 我點擊「確認」按鈕
  Then 我應該在 1 秒內看到成功動畫
  And 我應該看到彈出提示：「✨ 看！不用選分類,AI 都懂」
  And 輸入框應該清空，準備下一筆記錄

  When 我點擊「查看我的記帳」
  Then 我應該看到 1 筆記錄
  And 記錄應顯示：
    | 欄位 | 值 |
    | 分類 | 餐飲 🍽️ |
    | 金額 | $65 |
    | 日期 | 今天 |
    | 信心度 | 95% |

Scenario: 鼓勵繼續記帳（習慣養成）
  Given 我已成功記錄 1 筆
  When 我輸入第 2 筆「捷運 30」
  Then 應顯示：「很好！再記 1 筆就能看到統計圖表」

  When 我輸入第 3 筆「午餐 120」
  Then 應顯示慶祝動畫 🎉
  And 應解鎖「支出分析」功能
  And 應自動跳轉到分析頁面，顯示圓餅圖
```

### 場景 2: 訂閱管理與提醒

```gherkin
Feature: 訂閱管理與扣款提醒
  作為一個訂閱狂人
  我想要清楚追蹤所有固定支出
  這樣我就不會被突然扣款嚇到

Scenario: 新增訂閱並計算月度總額
  Given 我已登入 QuickSmart
  When 我進入「訂閱管理」頁面
  And 我點擊「新增訂閱」
  And 我填寫以下資訊：
    | 欄位 | 值 |
    | 名稱 | Netflix |
    | 金額 | 390 |
    | 週期 | 每月 |
    | 首次扣款日 | 2025-01-15 |
  And 我點擊「儲存」
  Then 我應該看到成功訊息：「已新增 Netflix」
  And 訂閱卡片應顯示：
    | 欄位 | 值 |
    | 下次扣款 | 2025-02-15 |
    | 距離扣款 | 26 天 |
  And 月度訂閱總額應更新為「$390/月」

Scenario: 多個訂閱的月度總額計算
  Given 我有以下訂閱：
    | 名稱 | 金額 | 週期 |
    | Netflix | 390 | 每月 |
    | Spotify | 149 | 每月 |
    | iCloud | 900 | 每年 |
  When 我查看訂閱總覽頁面
  Then 月度總額應顯示「$614/月」
  And 計算邏輯應為：390 + 149 + (900/12) = 614

Scenario: 扣款前 3 天發送提醒
  Given 我有一個 Netflix 訂閱，下次扣款日為「2025-02-15」
  And 今天是「2025-02-12」
  When 系統執行每日定時任務 (Cron Job)
  Then 我應該收到推播通知：「Netflix 將在 3 天後扣款 $390」
  And 我應該收到 Email 通知
  And 訂閱卡片應標記為「即將扣款」(黃色邊框)

Scenario: 扣款當天自動記帳
  Given 我有一個 Spotify 訂閱，下次扣款日為「今天」
  When 系統執行每日定時任務
  Then 應自動新增一筆支出記錄：
    | 欄位 | 值 |
    | 分類 | 訂閱 |
    | 金額 | 149 |
    | 描述 | Spotify (自動記帳) |
    | 日期 | 今天 |
  And 下次扣款日應更新為「下個月同日」
  And 我應該收到通知：「已自動記錄 Spotify $149」
```

### 場景 3: AI 分類錯誤修正與學習

```gherkin
Feature: AI 分類修正與學習機制
  作為使用者
  我想要能輕鬆修正 AI 的錯誤分類
  這樣 AI 就能越來越準確

Scenario: AI 低信心度時主動要求確認
  Given 我已登入
  When 我輸入「asdfjkl 123」(不明描述)
  Then AI 應返回低信心度結果 (< 50%)
  And 應彈出確認對話框：
    """
    AI 不太確定這筆記帳 (信心度: 30%)
    建議分類：其他
    請確認或手動選擇正確分類
    """
  And 應提供所有分類選項供選擇

Scenario: 修正 AI 錯誤分類並學習
  Given 我有一筆記錄「Uber 回家 120」被誤判為「娛樂」
  And AI 信心度為 65%
  When 我點擊該記錄進入編輯模式
  Then 應顯示目前分類：「娛樂」(紅色標記: AI 判定)

  When 我選擇「交通」分類
  And 我點擊「儲存並教導 AI」按鈕
  Then 記錄應更新為「交通」分類
  And 應顯示成功訊息：「已更新！AI 會記住這個修正 🧠」
  And 系統應記錄學習樣本：{input: "Uber 回家 120", correctCategory: "TRANSPORT"}

Scenario: 驗證 AI 學習效果
  Given AI 已從上次修正中學習
  When 我輸入「Uber 去公司 150」(類似但不同的描述)
  Then AI 應建議「交通」分類
  And 信心度應提升至 ≥ 92%
  And 應顯示提示：「AI 根據你的習慣判斷為『交通』」

Scenario: 批量修正相同類型錯誤
  Given 我有 5 筆「Uber」相關記錄都被誤判為「娛樂」
  When 我選擇這 5 筆記錄 (多選模式)
  And 我點擊「批量修正」
  And 我選擇「交通」分類
  Then 5 筆記錄應全部更新為「交通」
  And AI 應一次學習 5 個範例 (加速學習)
  And 應顯示：「已更新 5 筆記錄，AI 學習能力 +5% 📈」
```

---

## 3️⃣ 技術架構規格

### 3.1 API 端點完整規格

#### POST /api/expenses/parse

```typescript
// Request
{
  "text": "星巴克拿鐵 150 昨天",
  "userId": "user_abc123",
  "timezone": "Asia/Taipei"  // optional
}

// Response (Success)
{
  "success": true,
  "data": {
    "amount": 150,
    "category": "FOOD",
    "description": "星巴克拿鐵",
    "date": "2025-01-19T00:00:00+08:00",
    "confidence": 98,
    "fallbackUsed": false,
    "suggestions": ["餐飲", "咖啡"]
  },
  "meta": {
    "processingTime": 450,  // ms
    "modelUsed": "claude-3-5-sonnet",
    "cacheHit": false
  }
}

// Response (Error - Missing Amount)
{
  "success": false,
  "error": {
    "code": "MISSING_AMOUNT",
    "message": "忘記填金額了嗎？試試看「午餐 120」",
    "technicalMessage": "Amount not found in input string",
    "suggestion": "請輸入格式：描述 + 空格 + 金額"
  }
}

// Response (Error - AI Service Unavailable)
{
  "success": true,  // 降級成功仍返回 200
  "data": {
    "amount": 150,
    "category": "FOOD",
    "description": "星巴克拿鐵",
    "date": "2025-01-19T00:00:00+08:00",
    "confidence": 70,  // 降級後信心度較低
    "fallbackUsed": true  // 標記使用降級模式
  },
  "warning": {
    "code": "AI_FALLBACK_MODE",
    "message": "AI 小幫手暫時休息中，已切換到基本模式"
  }
}
```

**測試案例 (Integration Test)**
```typescript
describe('POST /api/expenses/parse', () => {
  it('應正確解析標準格式', async () => {
    const response = await request(app)
      .post('/api/expenses/parse')
      .send({ text: '早餐 65' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      amount: 65,
      category: 'FOOD',
      confidence: expect.toBeGreaterThanOrEqual(90)
    });
  });

  it('應拒絕無效金額', async () => {
    const response = await request(app)
      .post('/api/expenses/parse')
      .send({ text: '早餐 0' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_AMOUNT');
  });

  it('應在 AI 失效時自動降級', async () => {
    // Mock Claude API failure
    mockClaudeAPI.mockRejectedValue(new Error('Service Unavailable'));

    const response = await request(app)
      .post('/api/expenses/parse')
      .send({ text: '早餐 65' });

    expect(response.status).toBe(200);
    expect(response.body.data.fallbackUsed).toBe(true);
    expect(response.body.warning.code).toBe('AI_FALLBACK_MODE');
  });
});
```

#### GET /api/expenses

```typescript
// Request Query Parameters
{
  "month": "2025-01",      // optional, default: current month
  "category": "FOOD",      // optional filter
  "limit": 50,             // optional, default: 100
  "offset": 0              // optional, for pagination
}

// Response
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "exp_xyz789",
        "amount": 65,
        "category": "FOOD",
        "description": "早餐",
        "date": "2025-01-20T08:30:00+08:00",
        "aiConfidence": 95,
        "createdAt": "2025-01-20T08:35:00+08:00",
        "updatedAt": "2025-01-20T08:35:00+08:00"
      }
      // ... more expenses
    ],
    "summary": {
      "total": 12450,
      "count": 28,
      "byCategory": {
        "FOOD": 5200,
        "TRANSPORT": 1500,
        "SUBSCRIPTION": 539
        // ...
      }
    },
    "pagination": {
      "total": 28,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### 3.2 資料庫 Schema 規格

```sql
-- 支出記錄表
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  ai_confidence INTEGER CHECK (ai_confidence BETWEEN 0 AND 100),
  fallback_used BOOLEAN DEFAULT FALSE,

  -- 多設備同步欄位
  version INTEGER DEFAULT 1,
  last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified_device VARCHAR(50),
  sync_status VARCHAR(20) DEFAULT 'SYNCED',

  -- 審計欄位
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 索引優化
  INDEX idx_user_date (user_id, date DESC),
  INDEX idx_user_category (user_id, category),
  INDEX idx_sync_status (user_id, sync_status, last_modified_at)
);

-- 訂閱管理表
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
  next_billing_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'PAUSED')),
  category VARCHAR(50) DEFAULT 'SUBSCRIPTION',

  -- 統計欄位
  total_paid DECIMAL(12, 2) DEFAULT 0,
  billing_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_user_billing (user_id, next_billing_date),
  INDEX idx_status (status, next_billing_date)
);

-- AI 學習樣本表
CREATE TABLE ai_learning_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  correct_category VARCHAR(50) NOT NULL,
  original_category VARCHAR(50),
  original_confidence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  INDEX idx_user_input (user_id, input_text)
);
```

**資料完整性規格 (Constraints)**

| 約束類型 | 規格 | 測試案例 |
|---------|------|---------|
| 金額必須 > 0 | `CHECK (amount > 0)` | 嘗試插入 0 或負數應失敗 |
| 分類必須有效 | `CHECK (category IN (...))` | 嘗試插入無效分類應失敗 |
| 日期不能未來 | 應用層驗證 | 嘗試插入明天日期應拒絕 |
| 信心度範圍 | `CHECK (ai_confidence BETWEEN 0 AND 100)` | 嘗試插入 150 應失敗 |
| 用戶外鍵 | `REFERENCES users(id) ON DELETE CASCADE` | 刪除用戶應連帶刪除所有記錄 |

---

## 4️⃣ 測試策略規格

### 4.1 測試金字塔結構

```
           E2E Tests (3 scenarios)
          /                        \
    Integration Tests (15+)
       /                           \
  Unit Tests (50+)
```

**覆蓋率目標**
- Unit Tests: ≥ 85%
- Integration Tests: ≥ 70%
- E2E Tests: 3 個核心場景 (100%)

### 4.2 Unit Test 規格

```typescript
// __tests__/unit/parseExpense.spec.ts
import { describe, it, expect } from 'vitest';
import { parseExpense } from '@/application/use-cases/parseExpense';

describe('parseExpense - Specification by Example', () => {
  // 標準格式測試
  describe('標準格式解析', () => {
    const examples = [
      { input: '早餐 65', expected: { category: 'FOOD', amount: 65 } },
      { input: '午餐120', expected: { category: 'FOOD', amount: 120 } },
      { input: '星巴克 150', expected: { category: 'FOOD', amount: 150 } },
    ];

    it.each(examples)('應正確解析 "$input"', async ({ input, expected }) => {
      const result = await parseExpense(input);
      expect(result).toMatchObject(expected);
    });
  });

  // 邊界案例測試
  describe('邊界案例處理', () => {
    it('應拒絕缺少金額', async () => {
      await expect(parseExpense('早餐')).rejects.toThrow('MISSING_AMOUNT');
    });

    it('應拒絕零金額', async () => {
      await expect(parseExpense('早餐 0')).rejects.toThrow('INVALID_AMOUNT');
    });

    it('應拒絕負金額', async () => {
      await expect(parseExpense('早餐 -50')).rejects.toThrow('INVALID_AMOUNT');
    });

    it('應處理超大金額並發出警告', async () => {
      const result = await parseExpense('買房 999999999');
      expect(result.amount).toBe(999999999);
      expect(result.warning).toBe('AMOUNT_UNUSUALLY_LARGE');
    });
  });

  // 日期解析測試
  describe('日期解析', () => {
    it('應解析「昨天」為昨天日期', async () => {
      const result = await parseExpense('早餐 65 昨天');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(result.date).toEqual(yesterday.toISOString().split('T')[0]);
    });

    it('應拒絕未來日期', async () => {
      await expect(parseExpense('早餐 65 明天')).rejects.toThrow('FUTURE_DATE_NOT_ALLOWED');
    });
  });
});
```

### 4.3 Integration Test 規格

```typescript
// __tests__/integration/api/expenses.spec.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestServer } from '@/test-utils/server';
import { createTestUser } from '@/test-utils/fixtures';

describe('Expense API Integration Tests', () => {
  let server;
  let testUser;
  let authToken;

  beforeAll(async () => {
    server = await createTestServer();
    testUser = await createTestUser();
    authToken = await testUser.getAuthToken();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/expenses/parse', () => {
    it('應成功解析並創建支出記錄', async () => {
      const response = await server
        .post('/api/expenses/parse')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: '早餐 65' });

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        amount: 65,
        category: 'FOOD',
        userId: testUser.id
      });

      // 驗證資料庫確實有插入
      const expense = await db.expense.findFirst({
        where: { userId: testUser.id }
      });
      expect(expense).toBeTruthy();
      expect(expense.amount).toBe(65);
    });

    it('應在 AI 失效時自動降級', async () => {
      // 模擬 Claude API 失效
      mockClaudeAPI.simulateFailure();

      const response = await server
        .post('/api/expenses/parse')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: '早餐 65' });

      expect(response.status).toBe(200);
      expect(response.body.data.fallbackUsed).toBe(true);
      expect(response.body.data.confidence).toBeLessThan(80);
    });

    it('應記錄降級事件到監控系統', async () => {
      mockClaudeAPI.simulateFailure();

      await server
        .post('/api/expenses/parse')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: '早餐 65' });

      const events = await monitoring.getEvents({ type: 'AI_FALLBACK' });
      expect(events).toHaveLength(1);
      expect(events[0].userId).toBe(testUser.id);
    });
  });
});
```

### 4.4 E2E Test 規格

```typescript
// __tests__/e2e/step-definitions/expense.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('我已登入 QuickSmart', async function() {
  await this.page.goto('https://localhost:3000');
  await this.page.click('[data-testid="google-login-button"]');
  // Mock OAuth flow
  await this.mockGoogleAuth();
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

Then('記錄應顯示：', async function(dataTable) {
  const rows = dataTable.hashes();

  for (const row of rows) {
    const selector = `[data-testid="expense-${row.欄位}"]`;
    const actual = await this.page.textContent(selector);
    expect(actual).toBe(row.值);
  }
});
```

### 4.5 效能測試規格

```typescript
// __tests__/performance/load-test.spec.ts
import { test } from '@playwright/test';
import autocannon from 'autocannon';

test('API 應在高負載下維持效能', async () => {
  const result = await autocannon({
    url: 'http://localhost:3000/api/expenses/parse',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({ text: '早餐 65' }),
    connections: 50,      // 50 並發連線
    duration: 10,         // 持續 10 秒
  });

  // 驗證效能指標
  expect(result.latency.p95).toBeLessThan(1000);  // P95 < 1s
  expect(result.errors).toBe(0);                   // 無錯誤
  expect(result.non2xx).toBe(0);                   // 所有請求成功
});
```

---

## 5️⃣ MVP 開發計畫（SDD 驅動）

### Week 1-2: 基礎設施 + TDD 訓練

**開發任務**
- [ ] Next.js 14 + TypeScript 專案建置
- [ ] Vitest + Testing Library 配置
- [ ] Playwright + Cucumber 安裝
- [ ] PostgreSQL + Prisma 設定
- [ ] CI/CD Pipeline (GitHub Actions)

**測試訓練 (TDD Kata)**
```typescript
// Day 1: FizzBuzz Kata
// Day 2: String Calculator Kata
// Day 3: Bowling Game Kata
// 目標：團隊熟悉 Red-Green-Refactor 流程
```

**驗收標準**
- ✅ 所有團隊成員完成 3 個 Kata
- ✅ CI Pipeline 執行時間 < 5 分鐘
- ✅ 測試覆蓋率工具正常運作

### Week 3-4: 核心記帳功能（TDD + SDD）

**Day 1-3: AI 解析邏輯 (TDD)**

1. **Red**: 先寫失敗測試
```typescript
it('應解析「早餐 65」', async () => {
  const result = await parseExpense('早餐 65');
  expect(result).toEqual({ category: 'FOOD', amount: 65 });
});
// 執行 → ❌ FAIL
```

2. **Green**: 最小實現
```typescript
export async function parseExpense(input: string) {
  return { category: 'FOOD', amount: 65 };
}
// 執行 → ✅ PASS
```

3. **Refactor**: 整合真實邏輯
```typescript
export async function parseExpense(input: string) {
  const aiService = new AIParserService();
  return await aiService.parse(input);
}
// 執行 → ✅ PASS
```

**Day 4-6: 分類引擎 (SDD)**
```typescript
// 用 50+ 個真實範例驅動開發
const examples = [
  ['早餐', 'FOOD'],
  ['星巴克', 'FOOD'],
  ['Netflix', 'SUBSCRIPTION'],
  // ... 累積到 50 個
];

test.each(examples)('"%s" → "%s"', (input, expected) => {
  expect(classifier.classify(input)).toBe(expected);
});
```

**Day 7-10: API + UI 整合**
- [ ] 實作 POST /api/expenses/parse
- [ ] 實作前端輸入組件
- [ ] 整合測試驗證端到端流程

**驗收標準**
- ✅ Unit Test 覆蓋率 ≥ 90%
- ✅ 50 個範例全部通過
- ✅ API P95 回應時間 < 1s

### Week 5-6: 訂閱管理（SDD + BDD）

**SDD: 下次扣款日計算**
```typescript
const examples = [
  { cycle: 'MONTHLY', last: '2025-01-15', expected: '2025-02-15' },
  { cycle: 'MONTHLY', last: '2025-01-31', expected: '2025-02-28' },
  { cycle: 'YEARLY', last: '2024-02-29', expected: '2025-02-28' },
];

test.each(examples)('should calculate next billing', ({ cycle, last, expected }) => {
  const result = calculateNextBilling({ cycle, lastBilling: last });
  expect(result).toBe(expected);
});
```

**BDD: E2E 測試**
```gherkin
Scenario: 訂閱即將扣款提醒
  Given 我有一個 Netflix 訂閱，下次扣款日為 3 天後
  When 系統執行每日檢查任務
  Then 我應該收到推播通知
```

**驗收標準**
- ✅ 閏年/月底邊界案例 100% 正確
- ✅ E2E 測試通過
- ✅ 提醒任務成功率 ≥ 99%

### Week 7: 資料視覺化 + 第二個 E2E

**開發任務**
- [ ] 月度支出統計 API
- [ ] 圓餅圖組件 (Chart.js)
- [ ] 趨勢折線圖組件

**E2E 測試**
```gherkin
Scenario: 新用戶首次看到統計圖表
  Given 我已記帳 3 筆
  When 我進入「分析」頁面
  Then 我應該看到圓餅圖顯示分類占比
```

### Week 8: 優化、第三個 E2E、上線

**效能優化**
- [ ] Lighthouse 分數 ≥ 90
- [ ] 首屏載入 < 2s
- [ ] API 快取策略

**最後一個 E2E**
```gherkin
Scenario: AI 分類修正與學習
  Given 我有一筆 AI 誤判的記錄
  When 我手動修正分類
  Then 下次類似輸入應該正確分類
```

**驗收標準**
- ✅ 3 個 E2E 場景全部通過
- ✅ 測試覆蓋率達標 (Unit 85%, Integration 70%)
- ✅ 所有 Critical Bug 修復完成

---

## 6️⃣ 成功指標規格

### 6.1 產品指標

| 指標 | Month 1 | Month 2 | Month 3 | 測試驗證 |
|-----|---------|---------|---------|---------|
| 註冊用戶數 | 100 | 500 | 1,000 | - |
| 7 日留存率 | 30% | 35% | 40% | SQL Query |
| AI 準確率 | 85% | 90% | 92% | Unit Test |
| WAU | 50 | 200 | 400 | - |

### 6.2 技術指標

| 指標 | 目標值 | 測試方式 |
|-----|-------|---------|
| Unit Test 覆蓋率 | ≥ 85% | Vitest Coverage |
| Integration Test 覆蓋率 | ≥ 70% | Vitest Coverage |
| E2E 場景通過率 | 100% (3/3) | Playwright |
| API P95 回應時間 | < 1s | Load Test |
| CI 執行時間 | < 10 分鐘 | GitHub Actions |
| 錯誤率 | < 0.1% | Sentry |

### 6.3 質量指標 (Specification by Example)

```typescript
// __tests__/quality/metrics.spec.ts
describe('產品質量指標驗證', () => {
  it('AI 準確率應 ≥ 90%', async () => {
    const testCases = await loadTestCases(); // 100 個真實案例
    let correct = 0;

    for (const testCase of testCases) {
      const result = await parseExpense(testCase.input);
      if (result.category === testCase.expectedCategory) {
        correct++;
      }
    }

    const accuracy = (correct / testCases.length) * 100;
    expect(accuracy).toBeGreaterThanOrEqual(90);
  });

  it('API P95 回應時間應 < 1s', async () => {
    const responseTimes = [];

    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await request(app).post('/api/expenses/parse').send({ text: '早餐 65' });
      responseTimes.push(Date.now() - start);
    }

    responseTimes.sort((a, b) => a - b);
    const p95 = responseTimes[94]; // 95th percentile

    expect(p95).toBeLessThan(1000);
  });
});
```

---

## 7️⃣ 附錄：快速參考

### 何時使用哪種測試方法？

| 情境 | 方法 | 範例 |
|-----|------|------|
| 複雜演算法 | TDD | AI 解析、金額計算 |
| API 端點 | SDD | POST /api/expenses |
| 用戶旅程 | BDD | Onboarding、首次記帳 |
| 效能驗證 | Load Test | P95 < 1s |
| UI 視覺 | Storybook | 按鈕樣式、動畫 |

### 測試命名規範

```typescript
// ✅ 好的測試名稱
it('應拒絕缺少金額的輸入', ...)
it('應在 AI 失效時自動降級', ...)
it('應計算閏年的下次扣款日', ...)

// ❌ 不好的測試名稱
it('test1', ...)
it('should work', ...)
it('parseExpense', ...)
```

### Git Commit 規範

```
feat: 新增 AI 降級機制 (parseExpense.ts)
test: 補充 50 個分類測試範例 (CategoryClassifier.spec.ts)
fix: 修正閏年扣款日計算錯誤 (calculateNextBilling.ts)
refactor: 重構錯誤處理邏輯 (ErrorHandler.ts)
docs: 更新 API 規格文件 (PRD_SDD.md)
```

---

**文件版本**: v3.0 (SDD 優化版)
**最後更新**: 2025-10-20
**下一步**: 開始 Week 0 團隊培訓 🚀
