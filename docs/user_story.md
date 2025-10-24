# QuickSmart 智能記帳 - User Stories (BDD 格式)

**版本**: v1.0
**日期**: 2025-10-20
**基於**: EVENT_STORMING.md

---

## 📋 目錄

1. [User Story 概覽](#user-story-概覽)
2. [Epic 1: 快速記帳](#epic-1-快速記帳)
3. [Epic 2: 訂閱管理](#epic-2-訂閱管理)
4. [Epic 3: 用戶旅程](#epic-3-用戶旅程)
5. [Epic 4: 智能分析](#epic-4-智能分析)
6. [Epic 5: 系統穩定性](#epic-5-系統穩定性)
7. [Story 相依性圖](#story-相依性圖)
8. [Sprint 規劃建議](#sprint-規劃建議)

---

## 🎯 User Story 概覽

### Story Point 估算標準

| Points | 複雜度 | 工時 | 範例 |
|--------|--------|------|------|
| 1 | 簡單 | 2-4h | 簡單 CRUD、UI 調整 |
| 2 | 簡單偏中 | 4-8h | 含驗證的 CRUD |
| 3 | 中等 | 1-2 days | 簡單業務邏輯 + API |
| 5 | 中等偏高 | 2-3 days | 複雜業務邏輯 + 整合 |
| 8 | 高 | 3-5 days | 核心功能 + 外部整合 |
| 13 | 極高 | 1-2 weeks | 需拆分 |

### INVEST 原則檢查清單

- **I**ndependent: 可獨立開發與測試
- **N**egotiable: 細節可與 PO 協商
- **V**aluable: 為用戶創造價值
- **E**stimable: 可估算工作量
- **S**mall: 可在一個 Sprint 內完成
- **T**estable: 有明確的驗收條件

---

## Epic 1: 快速記帳

### Story 1.1: AI 自然語言解析記帳

**Story ID**: ES-001
**Epic**: 快速記帳
**Priority**: P0 (Must Have)
**Story Points**: 8

#### User Story

```
As a 忙碌的上班族
I want 輸入自然語言快速記帳（如 "早餐 65"）
So that 我可以在 3 秒內完成記帳，不需要手動選擇分類
```

#### Acceptance Criteria

##### AC1: 成功解析簡單記帳輸入

```gherkin
Given 用戶已登入 QuickSmart
  And AI 服務正常運作
When 用戶輸入 "早餐 65"
Then 系統應在 500ms 內回應
  And 解析結果應為:
    | 欄位        | 值      |
    | amount      | 65      |
    | category    | FOOD    |
    | confidence  | >= 95%  |
  And 應顯示成功通知 "✨ 已記帳!"
  And 應觸發 ExpenseCreated 事件
```

##### AC2: 成功解析複雜輸入（含時間、地點）

```gherkin
Given 用戶已登入
When 用戶輸入 "昨天晚上在誠品買書 450"
Then 解析結果應為:
    | 欄位        | 值              |
    | amount      | 450             |
    | category    | SHOPPING        |
    | date        | 昨天            |
    | description | 誠品買書        |
    | confidence  | >= 90%          |
```

##### AC3: 低信心度時要求用戶確認

```gherkin
Given 用戶已登入
When 用戶輸入 "xyz 100"
  And AI 信心度 < 80%
Then 系統應顯示確認對話框
  And 建議分類應列出 3 個選項
  And 用戶應可手動選擇分類
```

##### AC4: 支援多種金額格式

```gherkin
Given 用戶已登入
When 用戶輸入以下任一格式:
    | 輸入           |
    | "午餐 65"      |
    | "午餐 $65"     |
    | "午餐 NT$65"   |
    | "午餐 65元"    |
Then 所有輸入應解析出 amount = 65
```

#### Technical Notes

- 使用 Claude API (Sonnet 3.5)
- 超時設定: 10 秒
- Rate Limit: 60 req/min
- 快取相同輸入 5 分鐘

#### Definition of Done

- [ ] Unit Test 覆蓋率 >= 90%
- [ ] Integration Test 涵蓋 AC1-AC4
- [ ] API Response Time P95 < 1s
- [ ] 錯誤處理完整（網路錯誤、超時、API 失效）
- [ ] Monitoring Dashboard 設定完成

#### Dependencies

- 需要: US-005 (用戶註冊登入)
- 阻擋: US-002 (AI 降級機制)

---

### Story 1.2: AI 服務降級機制

**Story ID**: ES-002
**Epic**: 快速記帳
**Priority**: P0 (Must Have)
**Story Points**: 5

#### User Story

```
As a 系統管理員
I want 當 AI 服務失效時自動切換到規則引擎
So that 用戶可以持續使用記帳功能而不中斷
```

#### Acceptance Criteria

##### AC1: AI 超時時啟動降級模式

```gherkin
Given AI 服務已設定 10 秒超時
  And 規則引擎已配置完成
When Claude API 回應超過 10 秒
Then 系統應自動切換到規則引擎
  And 應觸發 FallbackModeActivated 事件
  And 應記錄到 Sentry
  And 用戶應看到提示 "AI 暫時休息中,已切換基本模式"
```

##### AC2: AI 錯誤時啟動降級模式

```gherkin
Given AI 服務正常運作中
When Claude API 回應 503 Service Unavailable
Then 系統應立即切換到規則引擎
  And 解析結果應標記 fallbackUsed = true
  And confidence 應設為 70%
```

##### AC3: 規則引擎成功解析常見模式

```gherkin
Given 降級模式已啟動
When 用戶輸入以下常見模式:
    | 輸入           | 期望分類   |
    | "早餐 65"      | FOOD       |
    | "捷運 20"      | TRANSPORT  |
    | "Netflix 390"  | ENTERTAINMENT |
Then 所有輸入應正確解析
  And confidence 應為 70%
  And fallbackUsed 應為 true
```

##### AC4: 降級模式監控告警

```gherkin
Given 降級模式已啟動
When 連續 10 分鐘使用降級模式
Then 系統應發送 Slack 告警給技術團隊
  And 監控 Dashboard 應顯示紅色警示
```

#### Technical Notes

- 規則引擎使用正則表達式 + 關鍵字匹配
- 維護關鍵字字典 (foods.json, transports.json...)
- 監控使用 Sentry + Prometheus

#### Definition of Done

- [ ] Unit Test 覆蓋率 >= 95%
- [ ] 模擬 AI 失效的 Integration Test
- [ ] 規則引擎準確率測試 >= 75%
- [ ] Sentry 整合完成
- [ ] Runbook 文件完成

#### Dependencies

- 被阻擋於: US-001 (AI 解析)

---

### Story 1.3: 分類修正與 AI 學習

**Story ID**: ES-003
**Epic**: 快速記帳
**Priority**: P1 (Should Have)
**Story Points**: 5

#### User Story

```
As a 用戶
I want 修正 AI 錯誤的分類
So that AI 可以學習我的習慣,未來更準確
```

#### Acceptance Criteria

##### AC1: 修正分類成功

```gherkin
Given 用戶有一筆支出記錄
  And 分類為 ENTERTAINMENT (AI 自動分類)
When 用戶點擊該記錄
  And 將分類改為 TRANSPORT
  And 點擊確認
Then 記錄應更新為 TRANSPORT
  And 應觸發 CategoryCorrected 事件
  And version 欄位應 +1
  And 應顯示通知 "AI 會記住這個修正 🧠"
```

##### AC2: 學習樣本儲存

```gherkin
Given 用戶修正了分類
When CategoryCorrected 事件觸發
Then 系統應儲存學習樣本:
    | 欄位            | 值                    |
    | inputText       | 原始輸入文字          |
    | correctCategory | TRANSPORT             |
    | userId          | 當前用戶 ID           |
    | timestamp       | 修正時間              |
  And 應觸發 AILearned 事件
```

##### AC3: 多次修正後改善準確率

```gherkin
Given 用戶已修正 "Uber 回家 120" 為 TRANSPORT 5 次
When 用戶再次輸入 "Uber 去公司 95"
Then AI 應正確分類為 TRANSPORT
  And confidence 應 >= 95%
```

##### AC4: 修正歷史記錄查詢

```gherkin
Given 用戶已修正多筆分類
When 用戶進入設定頁面
  And 點擊 "AI 學習記錄"
Then 應顯示最近 20 筆修正記錄
  And 每筆應顯示:
    | 欄位        |
    | 原始輸入    |
    | 原分類      |
    | 修正後分類  |
    | 修正時間    |
```

#### Technical Notes

- 學習樣本儲存至 learning_samples 表
- 定期（每週）批次更新 AI 提示詞
- 用戶個人化模型（V1.1 功能）

#### Definition of Done

- [ ] Unit Test: correctCategory() 方法
- [ ] Integration Test: 完整修正流程
- [ ] E2E Test: UI 修正操作
- [ ] 資料庫 Migration Script
- [ ] 學習效果 A/B Test 設計文件

#### Dependencies

- 需要: US-001 (AI 解析)

---

### Story 1.4: 支出記錄 CRUD

**Story ID**: ES-004
**Epic**: 快速記帳
**Priority**: P0 (Must Have)
**Story Points**: 3

#### User Story

```
As a 用戶
I want 查看、編輯、刪除我的支出記錄
So that 我可以管理我的財務資料
```

#### Acceptance Criteria

##### AC1: 查看支出列表（分頁）

```gherkin
Given 用戶有 100 筆支出記錄
When 用戶開啟支出頁面
Then 應顯示最近 20 筆記錄（依日期降冪）
  And 應顯示分頁控制元件
  And 每筆記錄應顯示:
    | 欄位        |
    | 日期        |
    | 金額        |
    | 分類圖示    |
    | 描述        |
```

##### AC2: 編輯支出記錄

```gherkin
Given 用戶點擊一筆支出記錄
When 用戶修改金額為 200
  And 修改分類為 SHOPPING
  And 點擊儲存
Then 記錄應成功更新
  And version 應 +1
  And 應觸發 ExpenseUpdated 事件
  And 應顯示通知 "已更新"
```

##### AC3: 刪除支出記錄

```gherkin
Given 用戶點擊一筆支出記錄
When 用戶點擊刪除按鈕
  And 確認刪除對話框
Then 記錄應被軟刪除（deletedAt 欄位）
  And 應觸發 ExpenseDeleted 事件
  And 列表應移除該記錄
  And 應顯示通知 "已刪除"
```

##### AC4: 篩選與搜尋

```gherkin
Given 用戶在支出頁面
When 用戶選擇分類 FOOD
  And 設定日期範圍 2025-10-01 to 2025-10-20
Then 應只顯示符合條件的記錄
  And 應顯示總金額統計
```

#### Technical Notes

- 軟刪除機制（deletedAt）
- 分頁: 20 筆/頁
- 快取策略: Redis 5 分鐘

#### Definition of Done

- [ ] Unit Test: CRUD 方法
- [ ] Integration Test: API 端點
- [ ] E2E Test: UI 操作流程
- [ ] API 文件完成
- [ ] 效能測試: 1000 筆資料載入 < 1s

#### Dependencies

- 需要: US-001 (AI 解析)

---

## Epic 2: 訂閱管理

### Story 2.1: 新增訂閱服務

**Story ID**: ES-010
**Epic**: 訂閱管理
**Priority**: P1 (Should Have)
**Story Points**: 5

#### User Story

```
As a 用戶
I want 新增定期扣款的訂閱服務（如 Netflix, Spotify）
So that 系統可以自動提醒我扣款日期,避免忘記
```

#### Acceptance Criteria

##### AC1: 成功新增月訂閱

```gherkin
Given 用戶已登入
When 用戶填寫訂閱表單:
    | 欄位            | 值             |
    | name            | Netflix        |
    | amount          | 390            |
    | billingCycle    | MONTHLY        |
    | firstBillingDate| 2025-10-15     |
  And 點擊儲存
Then 訂閱應成功創建
  And 應觸發 SubscriptionAdded 事件
  And 應自動計算 nextBillingDate = 2025-11-15
  And 應觸發 BillingDateCalculated 事件
  And 應顯示通知 "已新增訂閱"
```

##### AC2: 成功新增年訂閱

```gherkin
Given 用戶填寫訂閱表單:
    | name            | iCloud         |
    | amount          | 990            |
    | billingCycle    | YEARLY         |
    | firstBillingDate| 2025-02-29     |
When 點擊儲存
Then nextBillingDate 應為 2026-02-28（非閏年）
  And 應觸發相關事件
```

##### AC3: 表單驗證

```gherkin
Given 用戶填寫訂閱表單
When 欄位驗證失敗:
    | 情境                | 錯誤訊息              |
    | name 為空           | "請輸入服務名稱"      |
    | amount <= 0         | "金額必須大於 0"      |
    | firstBillingDate 為過去 | "請選擇今天或未來日期" |
Then 應顯示對應錯誤訊息
  And 不應提交表單
```

##### AC4: 訂閱列表顯示

```gherkin
Given 用戶已新增 3 個訂閱
When 用戶進入訂閱頁面
Then 應顯示所有訂閱
  And 每個訂閱應顯示:
    | 欄位            |
    | 服務名稱        |
    | 金額            |
    | 週期（月/年）   |
    | 下次扣款日      |
    | 距離扣款天數    |
```

#### Technical Notes

- 使用 date-fns 處理日期計算
- 儲存時區資訊（用戶當地時區）

#### Definition of Done

- [ ] Unit Test: Subscription 聚合方法
- [ ] Integration Test: POST /api/subscriptions
- [ ] E2E Test: 完整新增流程
- [ ] 日期計算邊界案例測試（閏年、月底）
- [ ] API 文件完成

#### Dependencies

- 需要: US-005 (用戶登入)
- 阻擋: US-011 (扣款提醒)

---

### Story 2.2: 訂閱扣款提醒

**Story ID**: ES-011
**Epic**: 訂閱管理
**Priority**: P1 (Should Have)
**Story Points**: 8

#### User Story

```
As a 用戶
I want 在訂閱扣款前 3 天、1 天、當天收到通知
So that 我可以提前準備資金或取消不需要的訂閱
```

#### Acceptance Criteria

##### AC1: 扣款前 3 天推播通知

```gherkin
Given 今天是 2025-10-12
  And 用戶有 Netflix 訂閱,下次扣款日為 2025-10-15
When Cron Job 在每日 00:00 執行
Then 系統應發送推播通知:
    | 標題        | "Netflix 即將扣款"           |
    | 內容        | "將在 3 天後扣款 NT$390"     |
    | 深層連結    | /subscriptions/{id}          |
  And 應觸發 BillingReminderSent 事件
```

##### AC2: 扣款前 1 天推播通知

```gherkin
Given 今天是 2025-10-14
  And Netflix 下次扣款日為 2025-10-15
When Cron Job 執行
Then 應發送提醒 "將在 1 天後扣款 NT$390"
```

##### AC3: 扣款當天通知

```gherkin
Given 今天是 2025-10-15（扣款日）
When Cron Job 執行
Then 應發送通知 "今天將扣款 NT$390"
  And 應自動創建支出記錄
  And 應觸發 ExpenseAutoCreated 事件
```

##### AC4: Email 備援通知

```gherkin
Given 用戶的推播通知發送失敗
When 重試 3 次仍失敗
Then 系統應發送 Email 通知
  And Email 主題應為 "Netflix 即將扣款"
  And Email 應包含完整訂閱資訊
```

##### AC5: Cron Job 容錯機制

```gherkin
Given Cron Job 因系統故障未執行
When 系統恢復後重新執行
Then 應補發所有漏發的通知
  And 應記錄執行日誌
```

#### Technical Notes

- Cron Job: 每日 00:00 (UTC+8)
- 使用 node-cron 或 Bull Queue
- 推播: Firebase Cloud Messaging
- Email: SendGrid

#### Definition of Done

- [ ] Unit Test: shouldSendReminder() 方法
- [ ] Integration Test: Cron Job 執行
- [ ] E2E Test: 完整通知流程
- [ ] 模擬系統故障的容錯測試
- [ ] Monitoring Dashboard 設定
- [ ] Runbook 文件完成

#### Dependencies

- 需要: US-010 (新增訂閱)
- 需要: US-015 (推播通知基礎設施)

---

### Story 2.3: 訂閱自動記帳

**Story ID**: ES-012
**Epic**: 訂閱管理
**Priority**: P1 (Should Have)
**Story Points**: 5

#### User Story

```
As a 用戶
I want 訂閱扣款當天自動創建支出記錄
So that 我不需要手動記帳,財務記錄自動保持完整
```

#### Acceptance Criteria

##### AC1: 扣款日自動創建支出

```gherkin
Given 今天是 2025-10-15
  And Spotify 訂閱,nextBillingDate = 2025-10-15
When Cron Job 執行扣款邏輯
Then 應自動創建支出記錄:
    | 欄位        | 值                    |
    | amount      | 149                   |
    | category    | ENTERTAINMENT         |
    | description | "Spotify (自動記帳)"  |
    | date        | 2025-10-15            |
  And 應觸發 SubscriptionBilled 事件
  And 應觸發 ExpenseAutoCreated 事件
  And Spotify.totalPaid 應增加 149
  And Spotify.billingCount 應 +1
```

##### AC2: 計算下次扣款日

```gherkin
Given Spotify 訂閱已扣款
When SubscriptionBilled 事件處理完成
Then 應自動計算下次扣款日:
    | billingCycle | 當前日期   | 下次扣款日  |
    | MONTHLY      | 2025-10-15 | 2025-11-15  |
    | YEARLY       | 2025-10-15 | 2026-10-15  |
  And 應觸發 BillingDateCalculated 事件
```

##### AC3: 月底邊界案例處理

```gherkin
Given 訂閱的 firstBillingDate = 2025-01-31
  And billingCycle = MONTHLY
When 計算 2 月的下次扣款日
Then nextBillingDate 應為 2025-02-28（非閏年）
  Or 2024-02-29（閏年）
```

##### AC4: 扣款失敗通知

```gherkin
Given 自動記帳流程執行
When 創建支出記錄失敗（資料庫錯誤）
Then 應記錄錯誤到 Sentry
  And 應發送告警給技術團隊
  And 應標記該訂閱為 "需要手動處理"
  And 應通知用戶 "自動記帳失敗,請手動確認"
```

#### Technical Notes

- 使用事務（Transaction）確保資料一致性
- 冪等性設計（避免重複扣款）

#### Definition of Done

- [ ] Unit Test: bill() 方法（包含邊界案例）
- [ ] Integration Test: 完整自動扣款流程
- [ ] 邊界案例測試 >= 20 個
- [ ] 錯誤處理測試
- [ ] 冪等性測試

#### Dependencies

- 需要: US-010 (新增訂閱)
- 需要: US-001 (支出 CRUD)

---

### Story 2.4: 訂閱管理操作

**Story ID**: ES-013
**Epic**: 訂閱管理
**Priority**: P2 (Could Have)
**Story Points**: 3

#### User Story

```
As a 用戶
I want 暫停、取消、編輯訂閱
So that 我可以靈活管理我的定期支出
```

#### Acceptance Criteria

##### AC1: 取消訂閱

```gherkin
Given 用戶有 Netflix 訂閱
When 用戶點擊取消按鈕
  And 選擇取消原因 "不再使用"
  And 確認取消
Then 訂閱狀態應更新為 CANCELLED
  And 應觸發 SubscriptionCancelled 事件
  And 應停止發送提醒
  And 應顯示通知 "已取消訂閱"
```

##### AC2: 暫停訂閱

```gherkin
Given 用戶有 Spotify 訂閱
When 用戶點擊暫停按鈕
  And 設定暫停至 2025-12-31
Then 訂閱狀態應更新為 PAUSED
  And 應觸發 SubscriptionPaused 事件
  And 暫停期間不應發送提醒
  And 2026-01-01 應自動恢復為 ACTIVE
```

##### AC3: 編輯訂閱

```gherkin
Given 用戶點擊編輯訂閱
When 用戶修改金額為 490
  And 修改下次扣款日為 2025-11-01
  And 點擊儲存
Then 訂閱應成功更新
  And nextBillingDate 應重新計算
  And 應顯示通知 "已更新訂閱"
```

##### AC4: 查看訂閱歷史

```gherkin
Given 用戶有 Netflix 訂閱已扣款 5 次
When 用戶點擊訂閱詳情
Then 應顯示:
    | 欄位            | 值          |
    | 總支出          | 1950        |
    | 扣款次數        | 5           |
    | 平均月支出      | 390         |
  And 應顯示最近 10 次扣款記錄
```

#### Definition of Done

- [ ] Unit Test: cancel(), pause() 方法
- [ ] Integration Test: PATCH /api/subscriptions/{id}
- [ ] E2E Test: UI 操作流程
- [ ] API 文件更新

#### Dependencies

- 需要: US-010 (新增訂閱)

---

## Epic 3: 用戶旅程

### Story 3.1: 用戶註冊與登入

**Story ID**: ES-005
**Epic**: 用戶旅程
**Priority**: P0 (Must Have)
**Story Points**: 5

#### User Story

```
As a 新用戶
I want 使用 Google 或 Email 註冊登入
So that 我可以安全地存取我的記帳資料
```

#### Acceptance Criteria

##### AC1: Google OAuth 註冊

```gherkin
Given 用戶在登入頁面
When 用戶點擊 "使用 Google 登入"
  And 完成 Google OAuth 流程
Then 系統應創建用戶帳號
  And 應觸發 UserRegistered 事件
  And 應自動登入
  And 應導向 Onboarding 流程
```

##### AC2: Email + 密碼註冊

```gherkin
Given 用戶選擇 Email 註冊
When 用戶填寫:
    | 欄位        | 值                    |
    | email       | test@example.com      |
    | password    | SecurePass123!        |
  And 點擊註冊
Then 應發送驗證信到 test@example.com
  And 驗證信應包含驗證連結
  And 點擊連結後帳號應啟用
  And 應觸發 UserRegistered 事件
```

##### AC3: 登入成功

```gherkin
Given 用戶已完成註冊
When 用戶輸入正確的 email 和密碼
  And 點擊登入
Then 應創建 Session
  And 應觸發 UserAuthenticated 事件
  And 應導向首頁
  And Session 應在 30 天後過期
```

##### AC4: 登入失敗處理

```gherkin
Given 用戶輸入錯誤密碼
When 嘗試登入
Then 應顯示錯誤訊息 "Email 或密碼錯誤"
  And 連續失敗 5 次後應鎖定帳號 15 分鐘
  And 應記錄失敗事件到 Sentry
```

#### Technical Notes

- OAuth: Passport.js + Google Strategy
- 密碼: bcrypt (10 rounds)
- Session: JWT (httpOnly cookie)
- Rate Limit: 5 次/15min

#### Definition of Done

- [ ] Unit Test: AuthService 方法
- [ ] Integration Test: 註冊/登入 API
- [ ] E2E Test: 完整用戶流程
- [ ] 安全測試: SQL Injection, XSS
- [ ] OWASP Top 10 檢查

#### Dependencies

- 阻擋: 所有功能（基礎設施）

---

### Story 3.2: 用戶引導流程 (Onboarding)

**Story ID**: ES-006
**Epic**: 用戶旅程
**Priority**: P1 (Should Have)
**Story Points**: 5

#### User Story

```
As a 新用戶
I want 一個簡單的引導流程（3 步驟）
So that 我可以快速了解產品功能並開始記帳
```

#### Acceptance Criteria

##### AC1: 步驟 1 - 歡迎畫面

```gherkin
Given 用戶剛完成註冊
When 進入 Onboarding 流程
Then 應顯示歡迎畫面:
    | 內容                            |
    | 標題: "歡迎使用 QuickSmart!"    |
    | 副標題: "3 秒記帳,AI 自動分類"  |
    | 按鈕: "開始使用"                |
  And 應觸發 OnboardingStarted 事件
```

##### AC2: 步驟 2 - 功能介紹

```gherkin
Given 用戶在步驟 1
When 點擊 "開始使用"
Then 應顯示功能介紹（輪播 3 頁）:
    | 頁面 | 標題              | 圖示 |
    | 1    | "自然語言記帳"    | 💬   |
    | 2    | "訂閱管理"        | 📅   |
    | 3    | "AI 智能分析"     | 🧠   |
  And 每頁應有 "下一步" 按鈕
```

##### AC3: 步驟 3 - 首次記帳

```gherkin
Given 用戶在步驟 2 最後一頁
When 點擊 "開始記帳"
Then 應顯示記帳輸入框
  And 應有提示文字 "試試看: 早餐 65"
  And 用戶完成首次記帳後
  And 應觸發 OnboardingCompleted 事件
  And 應觸發 AhaMomentReached 事件
  And 應顯示慶祝動畫 "🎉 完成首次記帳!"
```

##### AC4: 跳過引導

```gherkin
Given 用戶在任何 Onboarding 步驟
When 點擊 "跳過"
Then 應導向首頁
  And onboardingCompleted 應保持 false
  And 下次登入應再次顯示引導
```

##### AC5: Aha Moment 追蹤

```gherkin
Given 用戶完成首次記帳
When AhaMomentReached 事件觸發
Then 應記錄到 Analytics:
    | 欄位              | 值              |
    | userId            | 當前用戶        |
    | trigger           | first_expense   |
    | registrationToAha | 3 分鐘（範例）  |
  And 應發送歡迎 Email
```

#### Technical Notes

- 使用 react-joyride 或自建輪播
- 動畫: Framer Motion
- Analytics: Mixpanel / Google Analytics

#### Definition of Done

- [ ] Unit Test: completeOnboarding() 方法
- [ ] E2E Test: 完整引導流程
- [ ] A/B Test 設計文件（測試不同版本）
- [ ] Analytics 事件設定完成
- [ ] UX 測試（5 位用戶）

#### Dependencies

- 需要: US-005 (用戶登入)
- 需要: US-001 (AI 解析記帳)

---

### Story 3.3: Telegram Bot 整合

**Story ID**: ES-007
**Epic**: 用戶旅程
**Priority**: P2 (Could Have)
**Story Points**: 8

#### User Story

```
As a 用戶
I want 透過 Telegram Bot 快速記帳
So that 我不需要開啟 App,在聊天中就能記帳
```

#### Acceptance Criteria

##### AC1: 綁定 Telegram 帳號

```gherkin
Given 用戶已登入 QuickSmart
When 用戶進入設定頁面
  And 點擊 "連結 Telegram"
Then 應顯示 Telegram Bot 連結
  And 用戶點擊連結後應開啟 Telegram
  And 輸入 /start 後應綁定成功
  And 應觸發 TelegramLinked 事件
  And 應顯示通知 "Telegram 已連結"
```

##### AC2: 透過 Bot 記帳

```gherkin
Given 用戶已綁定 Telegram
When 用戶在 Telegram 發送 "午餐 85"
Then Bot 應回覆:
    | 內容                          |
    | "✅ 已記帳"                   |
    | "金額: NT$85"                 |
    | "分類: 飲食"                  |
    | "信心度: 95%"                 |
  And 支出記錄應同步到 QuickSmart
```

##### AC3: 透過 Bot 查詢今日支出

```gherkin
Given 用戶今天已記 3 筆帳
When 用戶在 Telegram 發送 "/today"
Then Bot 應回覆:
    | 內容                          |
    | "今日支出: NT$320"            |
    | "早餐 NT$65"                  |
    | "午餐 NT$85"                  |
    | "咖啡 NT$170"                 |
```

##### AC4: 訂閱提醒透過 Telegram 發送

```gherkin
Given 用戶已綁定 Telegram
  And 有 Netflix 訂閱即將扣款
When 系統發送提醒
Then Bot 應發送訊息:
    | 內容                              |
    | "🔔 Netflix 將在 3 天後扣款"      |
    | "金額: NT$390"                    |
    | "扣款日: 2025-10-15"              |
```

#### Technical Notes

- 使用 node-telegram-bot-api
- Webhook 接收訊息
- 需驗證 Telegram ID 唯一性

#### Definition of Done

- [ ] Unit Test: TelegramBotService 方法
- [ ] Integration Test: Webhook 處理
- [ ] E2E Test: 完整綁定+記帳流程
- [ ] Bot 安全性測試（防止濫用）
- [ ] Bot 部署至正式環境

#### Dependencies

- 需要: US-005 (用戶登入)
- 需要: US-001 (AI 解析)
- 需要: US-015 (通知基礎設施)

---

## Epic 4: 智能分析

### Story 4.1: 月度資料彙總

**Story ID**: ES-020
**Epic**: 智能分析
**Priority**: P2 (Could Have)
**Story Points**: 5

#### User Story

```
As a 用戶
I want 查看每月支出統計與分類佔比
So that 我可以了解我的消費習慣
```

#### Acceptance Criteria

##### AC1: 月度總覽頁面

```gherkin
Given 用戶在 2025-10 有 50 筆支出
When 用戶進入分析頁面
  And 選擇 2025-10 月
Then 應顯示:
    | 欄位            | 值          |
    | 總支出          | NT$15,000   |
    | 筆數            | 50          |
    | 日均消費        | NT$500      |
    | 最高單筆        | NT$1,200    |
  And 應顯示圓餅圖（按分類）
```

##### AC2: 分類排行榜

```gherkin
Given 用戶查看 2025-10 月分析
Then 應顯示分類排行:
    | 排名 | 分類      | 金額      | 佔比  |
    | 1    | FOOD      | NT$6,000  | 40%   |
    | 2    | TRANSPORT | NT$3,000  | 20%   |
    | 3    | SHOPPING  | NT$2,500  | 17%   |
  And 應支援點擊分類查看明細
```

##### AC3: 趨勢圖（最近 6 個月）

```gherkin
Given 用戶有 6 個月歷史資料
When 進入分析頁面
Then 應顯示折線圖:
    | 月份    | 總支出    |
    | 2025-05 | NT$12,000 |
    | 2025-06 | NT$14,000 |
    | ...     | ...       |
    | 2025-10 | NT$15,000 |
  And 應標記最高/最低月份
```

##### AC4: 資料彙總排程

```gherkin
Given Cron Job 設定為每月 1 號執行
When 2025-11-01 00:00 到達
Then 系統應彙總 2025-10 所有支出
  And 應觸發 MonthlyDataAggregated 事件
  And 應快取彙總結果（Redis）
  And 快取應在下次彙總時更新
```

#### Technical Notes

- 使用 Chart.js 或 Recharts 繪圖
- 快取策略: Redis 24 小時
- 資料量大時使用資料庫視圖（View）

#### Definition of Done

- [ ] Unit Test: 彙總計算邏輯
- [ ] Integration Test: Cron Job 執行
- [ ] E2E Test: UI 圖表渲染
- [ ] 效能測試: 10,000 筆資料載入 < 2s
- [ ] 快取失效測試

#### Dependencies

- 需要: US-001 (支出記錄)
- 阻擋: US-021 (AI 洞察)

---

### Story 4.2: AI 智能洞察生成

**Story ID**: ES-021
**Epic**: 智能分析
**Priority**: P2 (Could Have)
**Story Points**: 8

#### User Story

```
As a 用戶
I want AI 分析我的消費模式並提供建議
So that 我可以改善我的財務狀況
```

#### Acceptance Criteria

##### AC1: 生成洞察成功

```gherkin
Given 用戶有至少 30 天的支出資料
When 系統執行洞察生成（每月 1 號）
Then 應使用 Claude API 分析資料
  And 應生成 3-5 條洞察:
    | 類型              | 範例文字                              |
    | 消費習慣          | "你的飲食支出佔總支出 40%,高於平均值" |
    | 趨勢分析          | "本月交通費比上月增加 25%"            |
    | 建議              | "考慮使用月票可節省 NT$500/月"        |
  And 應觸發 InsightsGenerated 事件
```

##### AC2: 異常偵測

```gherkin
Given 用戶本月有單筆支出 NT$5,000
  And 月平均支出為 NT$1,500
When 系統執行異常偵測
Then 應觸發 AnomalyDetected 事件
  And 應標記該筆支出為異常
  And 應在洞察中顯示 "本月有 1 筆異常高額支出"
```

##### AC3: 趨勢識別

```gherkin
Given 用戶最近 3 個月飲食支出持續增加:
    | 月份    | 金額      |
    | 2025-08 | NT$5,000  |
    | 2025-09 | NT$5,500  |
    | 2025-10 | NT$6,000  |
When 系統分析趨勢
Then 應觸發 TrendIdentified 事件
  And 應在洞察中顯示 "飲食支出呈上升趨勢 (+20%)"
```

##### AC4: 洞察展示與互動

```gherkin
Given 系統已生成洞察
When 用戶進入分析頁面
Then 應在頂部顯示洞察卡片
  And 每張卡片應有:
    | 元素        |
    | 圖示        |
    | 標題        |
    | 內容        |
    | 相關數據    |
  And 用戶可點擊 "查看詳情" 深入分析
```

#### Technical Notes

- 使用 Claude API (prompt 工程)
- 至少 30 天資料才執行
- 成本控制: 每用戶每月 1 次

#### Definition of Done

- [ ] Unit Test: 異常偵測邏輯
- [ ] Integration Test: Claude API 整合
- [ ] E2E Test: 洞察顯示流程
- [ ] Prompt 工程測試（準確性）
- [ ] 成本監控設定

#### Dependencies

- 需要: US-020 (月度彙總)
- 需要: US-001 (支出記錄)

---

## Epic 5: 系統穩定性

### Story 5.1: 多設備同步與衝突解決

**Story ID**: ES-030
**Epic**: 系統穩定性
**Priority**: P1 (Should Have)
**Story Points**: 8

#### User Story

```
As a 用戶
I want 在多個裝置間同步我的記帳資料
So that 我可以在手機、平板、電腦上無縫使用
```

#### Acceptance Criteria

##### AC1: 即時同步（樂觀更新）

```gherkin
Given 用戶在手機 A 新增一筆支出
When 支出成功創建
Then 手機 A 應立即顯示新記錄（樂觀更新）
  And 應發送 POST 請求到伺服器
  And 伺服器回應成功後應確認同步
  And 手機 B（5 秒內）應自動更新列表
```

##### AC2: 版本衝突偵測

```gherkin
Given 用戶在手機 A 和手機 B 同時編輯同一筆記錄
  And 手機 A 先提交（version: 1 → 2）
When 手機 B 提交（仍使用 version: 1）
Then 伺服器應拒絕手機 B 的更新
  And 應觸發 SyncConflictDetected 事件
  And 手機 B 應收到 409 Conflict 錯誤
  And 應提示用戶 "此記錄已被其他裝置修改,請重新載入"
```

##### AC3: Last-Write-Wins 策略（MVP）

```gherkin
Given 發生同步衝突
When 用戶點擊 "重新載入"
Then 應顯示伺服器最新版本
  And 用戶可選擇:
    | 選項              |
    | "保留伺服器版本"  |
    | "覆蓋為我的版本"  |
  And 選擇後應重新提交（使用最新 version）
```

##### AC4: 離線緩存與排隊同步

```gherkin
Given 用戶在離線狀態下新增 3 筆支出
When 網路恢復
Then 系統應自動同步所有待處理操作
  And 應按時間順序提交
  And 失敗操作應重試 3 次
  And 重試失敗後應通知用戶
```

##### AC5: 同步狀態指示

```gherkin
Given 用戶在編輯記錄
Then 應顯示同步狀態圖示:
    | 狀態        | 圖示 |
    | 同步中      | ⏳   |
    | 同步成功    | ✅   |
    | 同步失敗    | ❌   |
    | 離線模式    | 📵   |
```

#### Technical Notes

- 樂觀鎖: version 欄位
- 離線: IndexedDB + Service Worker
- 同步機制: WebSocket 或輪詢

#### Definition of Done

- [ ] Unit Test: 版本衝突偵測邏輯
- [ ] Integration Test: 多裝置同步場景
- [ ] E2E Test: 離線 → 上線同步
- [ ] 衝突解決 UX 測試
- [ ] 效能測試: 100 筆待同步記錄

#### Dependencies

- 需要: US-001 (支出 CRUD)

---

### Story 5.2: 推播通知基礎設施

**Story ID**: ES-015
**Epic**: 系統穩定性
**Priority**: P1 (Should Have)
**Story Points**: 5

#### User Story

```
As a 系統管理員
I want 建立統一的推播通知基礎設施
So that 所有模組可以透過標準 API 發送通知
```

#### Acceptance Criteria

##### AC1: 發送推播通知成功

```gherkin
Given 用戶已授權推播通知權限
When 系統呼叫 NotificationAPI.sendPush()
  And 傳入參數:
    | userId  | "user123"                 |
    | title   | "Netflix 即將扣款"        |
    | body    | "將在 3 天後扣款 NT$390"  |
    | data    | { deepLink: "/subscriptions/1" } |
Then 推播應成功發送
  And 應觸發 NotificationSent 事件
  And 用戶裝置應顯示通知
```

##### AC2: 推播失敗重試機制

```gherkin
Given FCM 服務暫時不可用
When 發送推播失敗
Then 系統應重試 3 次（指數退避）
  And 重試間隔為 1s, 2s, 4s
  And 3 次失敗後應觸發 NotificationFailed 事件
  And 應記錄錯誤到 Sentry
```

##### AC3: Email 備援通知

```gherkin
Given 推播通知發送失敗
When 重試 3 次仍失敗
Then 系統應自動發送 Email
  And Email 內容應與推播相同
  And 應使用 SendGrid 發送
```

##### AC4: 通知偏好設定

```gherkin
Given 用戶進入通知設定頁面
When 用戶關閉 "訂閱提醒" 開關
Then 系統應記錄偏好設定
  And 之後不應發送訂閱相關推播
  And 但仍應發送 Email（如有設定）
```

##### AC5: 批次通知優化

```gherkin
Given 系統需要發送 100 則通知
When 使用批次 API
Then 應使用 FCM Batch Send
  And 應限制每批 500 則
  And 應記錄成功/失敗數量
```

#### Technical Notes

- 推播: Firebase Cloud Messaging
- Email: SendGrid
- 重試: Bull Queue + Redis
- 速率限制: 100 req/min

#### Definition of Done

- [ ] Unit Test: NotificationService 方法
- [ ] Integration Test: FCM/SendGrid 整合
- [ ] 重試邏輯測試
- [ ] 效能測試: 1000 則通知 < 10s
- [ ] Monitoring Dashboard 設定

#### Dependencies

- 被阻擋於: US-011 (訂閱提醒), US-007 (Telegram)

---

### Story 5.3: 監控與錯誤追蹤

**Story ID**: ES-031
**Epic**: 系統穩定性
**Priority**: P1 (Should Have)
**Story Points**: 3

#### User Story

```
As a 系統管理員
I want 完整的監控與錯誤追蹤
So that 我可以快速發現並修復系統問題
```

#### Acceptance Criteria

##### AC1: Sentry 錯誤追蹤

```gherkin
Given Sentry 已整合到系統
When 發生未捕獲的異常
Then 應自動記錄到 Sentry
  And 應包含:
    | 欄位          |
    | 錯誤訊息      |
    | Stack Trace   |
    | 用戶 ID       |
    | 請求參數      |
    | 環境資訊      |
  And 應發送 Slack 告警（生產環境）
```

##### AC2: API 效能監控

```gherkin
Given Prometheus 已設定
When API 端點被呼叫
Then 應記錄指標:
    | 指標名稱              | 類型        |
    | http_request_duration | Histogram   |
    | http_request_total    | Counter     |
    | ai_parse_duration     | Histogram   |
    | ai_fallback_count     | Counter     |
  And 應在 Grafana Dashboard 顯示
```

##### AC3: 業務指標監控

```gherkin
Given 系統正常運作
Then 應追蹤業務指標:
    | 指標                  |
    | 每日活躍用戶 (DAU)    |
    | 記帳成功率            |
    | AI 準確率             |
    | 降級模式使用率        |
    | 訂閱提醒送達率        |
  And 應每日產生報告
```

##### AC4: 告警規則設定

```gherkin
Given 監控系統運作中
When 觸發以下條件:
    | 條件                        | 告警等級 |
    | API P95 延遲 > 3s           | Warning  |
    | 錯誤率 > 1%                 | Critical |
    | 降級模式使用 > 10min        | Warning  |
    | 資料庫連線失敗              | Critical |
Then 應發送對應等級的 Slack 告警
  And Critical 等級應同時發送 Email
```

#### Technical Notes

- Sentry: 錯誤追蹤
- Prometheus + Grafana: 指標監控
- Slack Webhook: 告警通知

#### Definition of Done

- [ ] Sentry 整合完成
- [ ] Prometheus + Grafana 設定完成
- [ ] 所有 API 端點加入指標
- [ ] 告警規則測試
- [ ] Runbook 文件完成

#### Dependencies

- 無（基礎設施）

---

## 🔗 Story 相依性圖

```
                    ┌──────────────┐
                    │   US-005     │
                    │  用戶註冊    │
                    │  (Priority 0)│
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  US-001  │    │  US-006  │    │  US-010  │
    │ AI 解析  │    │ Onboarding│    │新增訂閱  │
    │  (P0)    │    │  (P1)    │    │  (P1)    │
    └────┬─────┘    └──────────┘    └────┬─────┘
         │                                │
         ├────────────┐                   │
         │            │                   │
         ▼            ▼                   ▼
    ┌──────────┐ ┌──────────┐      ┌──────────┐
    │  US-002  │ │  US-003  │      │  US-011  │
    │ AI 降級  │ │ 分類修正 │      │ 扣款提醒 │
    │  (P0)    │ │  (P1)    │      │  (P1)    │
    └──────────┘ └──────────┘      └────┬─────┘
         │                               │
         │                               │
         ▼                               ▼
    ┌──────────┐                   ┌──────────┐
    │  US-004  │                   │  US-012  │
    │支出 CRUD │                   │自動記帳  │
    │  (P0)    │                   │  (P1)    │
    └────┬─────┘                   └──────────┘
         │
         ▼
    ┌──────────┐
    │  US-020  │
    │月度彙總  │
    │  (P2)    │
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │  US-021  │
    │ AI 洞察  │
    │  (P2)    │
    └──────────┘

    ┌──────────┐
    │  US-015  │ ◄─────────┐
    │推播基礎  │            │
    │  (P1)    │            │
    └────┬─────┘            │
         │                  │
         └──────────────────┘
         (被 US-011, US-007 依賴)

    ┌──────────┐
    │  US-030  │
    │多設備同步│
    │  (P1)    │
    └──────────┘
    (可獨立開發)

    ┌──────────┐
    │  US-031  │
    │  監控    │
    │  (P1)    │
    └──────────┘
    (可獨立開發)
```

---

## 📅 Sprint 規劃建議

### Sprint 0: 基礎設施（2 weeks）

| Story ID | 標題           | Points | 優先級 |
|----------|----------------|--------|--------|
| US-005   | 用戶註冊登入   | 5      | P0     |
| US-015   | 推播通知基礎   | 5      | P1     |
| US-031   | 監控錯誤追蹤   | 3      | P1     |

**Sprint 目標**: 建立核心基礎設施,確保後續功能可順利開發

**驗收標準**:
- 用戶可成功註冊登入
- 推播通知可正常發送
- Sentry + Grafana 正常運作

---

### Sprint 1: MVP 核心功能（2 weeks）

| Story ID | 標題           | Points | 優先級 |
|----------|----------------|--------|--------|
| US-001   | AI 自然語言解析| 8      | P0     |
| US-002   | AI 降級機制    | 5      | P0     |

**Sprint 目標**: 實現快速記帳核心功能

**驗收標準**:
- 用戶可輸入自然語言記帳
- AI 失效時自動降級
- 記帳成功率 >= 95%

---

### Sprint 2: 記帳完整功能（2 weeks）

| Story ID | 標題           | Points | 優先級 |
|----------|----------------|--------|--------|
| US-003   | 分類修正與學習 | 5      | P1     |
| US-004   | 支出記錄 CRUD  | 3      | P0     |
| US-006   | Onboarding 流程| 5      | P1     |

**Sprint 目標**: 完善記帳功能與用戶體驗

**驗收標準**:
- 用戶可修正分類
- 支出 CRUD 完整
- 新用戶完成引導流程

---

### Sprint 3: 訂閱管理（2 weeks）

| Story ID | 標題           | Points | 優先級 |
|----------|----------------|--------|--------|
| US-010   | 新增訂閱服務   | 5      | P1     |
| US-011   | 訂閱扣款提醒   | 8      | P1     |

**Sprint 目標**: 實現訂閱管理功能

**驗收標準**:
- 用戶可新增訂閱
- 提醒正常發送（3天、1天、當天）
- 日期計算邊界案例通過

---

### Sprint 4: 訂閱進階功能（2 weeks）

| Story ID | 標題           | Points | 優先級 |
|----------|----------------|--------|--------|
| US-012   | 訂閱自動記帳   | 5      | P1     |
| US-013   | 訂閱管理操作   | 3      | P2     |
| US-030   | 多設備同步     | 8      | P1     |

**Sprint 目標**: 完善訂閱功能與多設備支援

**驗收標準**:
- 自動記帳正常運作
- 用戶可暫停/取消訂閱
- 多設備同步無衝突

---

### Sprint 5: 智能分析（2 weeks）

| Story ID | 標題           | Points | 優先級 |
|----------|----------------|--------|--------|
| US-020   | 月度資料彙總   | 5      | P2     |
| US-021   | AI 智能洞察    | 8      | P2     |

**Sprint 目標**: 提供資料分析功能

**驗收標準**:
- 月度統計正確
- AI 洞察有價值
- 圖表渲染流暢

---

### Sprint 6: 進階功能（2 weeks）

| Story ID | 標題           | Points | 優先級 |
|----------|----------------|--------|--------|
| US-007   | Telegram Bot   | 8      | P2     |

**Sprint 目標**: 提供額外通路

**驗收標準**:
- Telegram Bot 正常運作
- 可透過 Bot 記帳與查詢

---

## 📊 總體統計

### Story Points 分布

| Epic           | Story 數量 | 總 Points | 平均 Points |
|----------------|-----------|-----------|-------------|
| 快速記帳       | 4         | 21        | 5.25        |
| 訂閱管理       | 4         | 21        | 5.25        |
| 用戶旅程       | 3         | 18        | 6.0         |
| 智能分析       | 2         | 13        | 6.5         |
| 系統穩定性     | 3         | 16        | 5.33        |
| **總計**       | **16**    | **89**    | **5.56**    |

### 優先級分布

| 優先級 | Story 數量 | 總 Points |
|--------|-----------|-----------|
| P0     | 5         | 29        |
| P1     | 8         | 44        |
| P2     | 3         | 16        |

### 建議團隊配置

- **後端工程師**: 2 人（velocity: 13 points/sprint）
- **前端工程師**: 1 人（velocity: 8 points/sprint）
- **預估時程**: 6 sprints (12 weeks)

---

## ✅ Story 品質檢查清單

每個 Story 應滿足:

- [ ] 符合 INVEST 原則
- [ ] 有明確的 AC（Given-When-Then 格式）
- [ ] Story Points 已估算
- [ ] 相依性已識別
- [ ] Technical Notes 完整
- [ ] Definition of Done 明確
- [ ] 可在 1-2 Sprint 內完成

---

## 📝 文件維護

- 當需求變更時,更新對應 Story 的 AC
- 當技術方案調整時,更新 Technical Notes
- 每個 Sprint 結束後,回顧 Story Points 估算準確性
- 定期（每月）與 EVENT_STORMING.md 同步更新

**版本**: v1.0
**最後更新**: 2025-10-20
**下次審查**: Sprint Review 時

---

## 🎯 成功指標

### 開發效率指標

- Story 完成率 >= 90%
- Sprint Velocity 穩定度（變異係數 < 20%）
- 技術債比例 < 10%

### 產品品質指標

- 測試覆蓋率 >= 85%
- 生產環境錯誤率 < 0.5%
- API P95 回應時間 < 1s

### 用戶滿意度指標

- Onboarding 完成率 >= 60%
- Aha Moment 到達率 >= 70%
- 月活躍用戶留存率 >= 40%

---

**附註**: 本文件基於 EVENT_STORMING.md 的領域知識生成,所有 AC 均使用 BDD Given-When-Then 格式,確保開發與測試人員有共同語言。
