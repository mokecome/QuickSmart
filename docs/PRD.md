# QuickSmart 智慧記帳 Web App - 產品需求分析

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

### 典型使用場景

#### 場景 1：便利商店買早餐（高頻場景）
```
傳統 App 流程（7 步驟）：
1. 打開 App
2. 點擊「新增支出」
3. 選擇分類（餐飲 > 早餐）
4. 輸入金額
5. 選擇支付方式
6. 填寫備註（可選）
7. 儲存

QuickSmart 流程（2 步驟）：
1. 打開 App
2. 輸入「早餐 65」→ 完成
```

#### 場景 2：發現訂閱扣款（痛點場景）
```
用戶心聲：「咦？怎麼又被扣 390？」

QuickSmart 解決方案：
- 訂閱管理頁面清楚顯示所有固定支出
- 扣款前 3 天自動提醒
- 一鍵取消訂閱（外部連結）
```

#### 場景 3：月底檢視花費（決策場景）
```
傳統分析：餐飲 12,000、交通 3,500、娛樂 8,000...

QuickSmart AI 洞察：
「你這個月外食比上月多 35%，主要是晚餐（+2,800）。
建議：每週自煮 2 次晚餐，可省 2,400/月」
```

---

## 2️⃣ 功能優先級矩陣

### RICE 評分法（Reach × Impact × Confidence / Effort）

| 功能 | 觸及用戶 | 影響力 | 信心度 | 開發成本 | RICE 分數 | 優先級 |
|------|---------|--------|--------|----------|-----------|--------|
| **自然語言記帳** | 100% | 3 | 90% | 3週 | 90 | P0 |
| **智慧分類建議** | 100% | 2 | 80% | 2週 | 80 | P0 |
| **訂閱管理** | 60% | 3 | 95% | 2週 | 86 | P0 |
| **月度 AI 洞察** | 80% | 3 | 70% | 3週 | 56 | P1 |
| **Telegram 快捷輸入** | 40% | 2 | 85% | 1週 | 68 | P1 |
| **收入記錄** | 30% | 1 | 100% | 1週 | 30 | P2 |
| **預算設定** | 50% | 2 | 75% | 2週 | 38 | P2 |
| **多帳戶管理** | 20% | 1 | 60% | 2週 | 6 | P3 |
| **匯出報表** | 30% | 1 | 90% | 1週 | 27 | P3 |

### 功能分級說明

**P0（MVP 必備）- 2-3 月完成**
- 自然語言記帳：產品核心差異化功能
- 智慧分類建議：降低記帳摩擦的關鍵
- 訂閱管理：解決重要痛點，開發成本低

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

## 3️⃣ 技術可行性評估

### 核心技術棧建議

#### 前端架構
```
技術選型：Next.js 14 + React 18 + TypeScript
理由：
✅ SSR 提升首屏載入速度（關鍵指標）
✅ App Router 支援更好的代碼分割
✅ TypeScript 降低維護成本
⚠️ 風險：團隊學習曲線（建議 1 週培訓）
```

#### AI 自然語言處理

**方案 A：Claude API（推薦）**
```typescript
優勢：
- 理解中文語境能力強（「早餐 65」→ {category: "餐飲", amount: 65}）
- 支援 Streaming，用戶體驗好
- 成本可控（$0.015/1K tokens，預估 $0.003/次）

技術實現：
const parseExpense = async (input: string) => {
  const prompt = `解析記帳：${input}
  輸出 JSON：{amount, category, description, date}`;
  return await claude.messages.create({...});
}
```

**方案 B：本地 NLP（備案）**
```
工具：spaCy + 自訓練模型
優勢：無 API 成本
劣勢：準確率較低（預估 75% vs 95%）
```

**建議：MVP 用 Claude API，DAU > 10K 後評估混合方案**

**方案 C：降級策略（必備）**
```typescript
// 當 Claude API 失敗時的容錯機制
class ExpenseParser {
  async parse(input: string) {
    try {
      // 優先使用 Claude API
      return await claudeAPI.parse(input);
    } catch (error) {
      if (error.status === 429) {
        // Rate Limit → 使用規則引擎
        return await fallbackParser.parse(input);
      } else if (error.status >= 500) {
        // 服務中斷 → 降級模式
        return await fallbackParser.parse(input);
      }
      throw error; // 其他錯誤向上拋出
    }
  }
}

// 規則引擎（Fallback Parser）
const fallbackRules = [
  { pattern: /早餐|午餐|晚餐|星巴克|麥當勞/, category: '餐飲' },
  { pattern: /Uber|計程車|捷運|公車/, category: '交通' },
  { pattern: /Netflix|Spotify|Disney/, category: '訂閱' },
  // ... 累積 50+ 條規則
];

優勢：
✅ 保證 99.9% 可用性（API 失效時仍能記帳）
✅ 規則引擎準確率約 75%（可接受的降級）
✅ 用戶無感知切換（背景自動降級）

風險緩解：
⚠️ 定期檢查 Claude API 狀態（健康檢查）
⚠️ 降級模式會標記 confidence < 70，提示用戶檢查
⚠️ 記錄所有降級事件，用於監控分析
```

#### 資料庫設計

**方案：PostgreSQL + Prisma ORM**
```sql
-- 核心資料表
expenses (
  id, user_id, amount, category,
  description, date, created_at,
  ai_confidence DECIMAL -- AI 分類信心分數
)

subscriptions (
  id, user_id, name, amount,
  billing_cycle, next_billing_date,
  status ENUM('active', 'cancelled')
)

users (
  id, email, telegram_id,
  onboarding_completed BOOLEAN
)
```

**擴充性考量：**
- 用 `ai_confidence` 追蹤 AI 準確率
- `telegram_id` 為未來整合預留欄位

**多設備同步策略：**
```typescript
// 方案：樂觀鎖定（Optimistic Locking）+ Last-Write-Wins
expenses (
  id, user_id, amount, category,
  description, date, created_at,
  ai_confidence,
  version INT DEFAULT 1,           -- 版本號（樂觀鎖）
  last_modified_at TIMESTAMP,      -- 最後修改時間
  last_modified_device VARCHAR(50) -- 修改設備識別
)

// 衝突處理邏輯
async function updateExpense(id, data, expectedVersion) {
  const result = await db.expense.updateMany({
    where: {
      id: id,
      version: expectedVersion  // 樂觀鎖檢查
    },
    data: {
      ...data,
      version: { increment: 1 },
      last_modified_at: new Date(),
      last_modified_device: getCurrentDevice()
    }
  });

  if (result.count === 0) {
    // 版本衝突 → 提示用戶重新載入
    throw new ConflictError('資料已在其他裝置更新，請重新整理');
  }
}

MVP 簡化方案（推薦）：
✅ Last-Write-Wins（最後寫入覆蓋）
✅ 記錄 last_modified_at 用於衝突偵測
✅ 用戶修改時檢查時間戳，若過舊則提示重新載入

進階方案（V1.1）：
- 使用 WebSocket 推送即時更新
- 實作完整的 CRDT（無衝突複製資料型別）
```

#### AI 洞察引擎

**技術方案：**
```typescript
// 使用 Claude MCP (Model Context Protocol)
import { MCPClient } from '@modelcontextprotocol/sdk';

const generateInsights = async (userId: string) => {
  const expenses = await getMonthlyExpenses(userId);

  const insights = await mcp.callTool('analyze-spending', {
    data: expenses,
    compareWith: 'previous_month',
    focusOn: ['anomalies', 'trends', 'suggestions']
  });

  return insights; // AI 生成的個人化建議
}
```

**可行性：95%**（MCP 已成熟，有官方文件）

#### Telegram 整合

**技術實現：**
```typescript
import TelegramBot from 'node-telegram-bot-api';

bot.onText(/\/spend (.+)/, async (msg, match) => {
  const expense = await parseExpense(match[1]);
  await saveExpense(msg.from.id, expense);
  bot.sendMessage(msg.chat.id, '✅ 已記錄！');
});
```

**挑戰：**
- 用戶帳號綁定（OAuth flow）
- 訊息安全性（需加密）

**可行性：90%**（技術成熟，但需完善 UX）

### 技術風險評估

| 風險項目 | 嚴重性 | 可能性 | 緩解策略 |
|---------|--------|--------|---------|
| Claude API 成本超標 | 高 | 中 | 設置用戶每日呼叫上限（20次） |
| AI 分類錯誤率高 | 中 | 低 | 提供手動修正 + 學習機制 |
| 資料庫效能瓶頸 | 低 | 低 | 早期用 Vercel Postgres（自動擴展） |
| Telegram 帳號濫用 | 中 | 中 | Rate limiting + CAPTCHA |

### 錯誤處理與用戶體驗

#### 用戶友善的錯誤訊息設計

**核心原則：**
1. **說人話**：避免技術術語（如 "Error 500", "API timeout"）
2. **提供解決方案**：告訴用戶下一步該做什麼
3. **情感連結**：用溫暖的語氣，而非冰冷的錯誤碼

**錯誤訊息範例：**

```typescript
// ❌ 糟糕的範例
"AI_SERVICE_ERROR: Request failed with status code 500"

// ✅ 良好的範例
"哎呀！AI 小幫手暫時休息中
別擔心，我們已切換到基本模式，你仍可手動選擇分類 😊
（通常 1-2 分鐘就會恢復）"

// 錯誤分類與對應訊息
const ERROR_MESSAGES = {
  // 網路相關
  NETWORK_ERROR: {
    title: '網路似乎不太穩定',
    message: '請檢查網路連線後重試',
    action: '重試',
    severity: 'warning'
  },

  // AI 服務相關
  AI_SERVICE_UNAVAILABLE: {
    title: 'AI 小幫手暫時休息中',
    message: '別擔心，已切換到基本模式。你仍可記帳，只需手動選擇分類',
    action: '知道了',
    severity: 'info',
    fallback: true  // 已啟用降級模式
  },

  AI_RATE_LIMIT: {
    title: '今天記帳次數已達上限',
    message: '你今天已經記帳 20 次了！真棒 👍\n明天 00:00 後就能繼續使用 AI 功能',
    action: '手動記帳',
    severity: 'info'
  },

  // 輸入驗證
  INVALID_AMOUNT: {
    title: '金額好像怪怪的',
    message: '金額必須大於 0 喔！試試看「早餐 65」',
    action: '重新輸入',
    severity: 'error'
  },

  MISSING_AMOUNT: {
    title: '忘記填金額了嗎？',
    message: '試試看這樣輸入：「午餐 120」或「星巴克 150」',
    action: '重新輸入',
    severity: 'error'
  },

  // 同步衝突
  SYNC_CONFLICT: {
    title: '資料已在其他裝置更新',
    message: '你的手機剛才修改了這筆記帳，要重新載入最新資料嗎？',
    action: '重新載入',
    severity: 'warning'
  },

  // 認證相關
  UNAUTHORIZED: {
    title: '登入狀態已過期',
    message: '為了保護你的資料安全，請重新登入',
    action: '重新登入',
    severity: 'error'
  }
};

// 顯示錯誤的 UI 組件
function ErrorToast({ error }) {
  const config = ERROR_MESSAGES[error.code] || {
    title: '發生了一點小問題',
    message: '請稍後再試，或聯繫客服',
    severity: 'error'
  };

  return (
    <Toast severity={config.severity}>
      <h3>{config.title}</h3>
      <p>{config.message}</p>
      {config.action && <Button>{config.action}</Button>}
    </Toast>
  );
}
```

**錯誤分級與處理策略：**

| 嚴重性 | 用戶體驗 | 範例 | 處理方式 |
|--------|---------|------|---------|
| **Critical** | 阻斷操作 | 登入失效、付款失敗 | 全螢幕 Modal，強制處理 |
| **Error** | 操作失敗 | 金額無效、格式錯誤 | Toast 提示 + 保留輸入 |
| **Warning** | 可繼續但需注意 | 同步衝突、降級模式 | Toast 提示 + 允許繼續 |
| **Info** | 提示訊息 | 達到使用上限 | 輕量提示，3 秒自動消失 |

**設計檢查清單：**
- [ ] 所有錯誤訊息都用「你」稱呼用戶（而非「用戶」）
- [ ] 提供明確的下一步行動（按鈕文字要具體）
- [ ] 避免使用驚嘆號超過 1 個（減少焦慮感）
- [ ] 重要錯誤要記錄到 Sentry（但不顯示技術細節給用戶）

---

## 4️⃣ MVP 範圍定義

### MVP 核心原則
**一句話：用最少功能驗證「AI 降低記帳摩擦」的核心假設**

### MVP 功能清單（8 週開發）

#### Week 1-2：基礎架構
- [ ] Next.js 專案建置 + Tailwind CSS
- [ ] PostgreSQL + Prisma 設定
- [ ] 用戶註冊/登入（NextAuth.js + Google OAuth）
- [ ] 基本 UI 框架（首頁、記帳頁、列表頁）

#### Week 3-4：核心記帳功能
- [ ] **自然語言輸入框**
  ```
  範例：
  「早餐 65」→ {餐飲, $65, 今天}
  「星巴克 150 昨天」→ {餐飲, $150, 昨天}
  「電影票 320」→ {娛樂, $320, 今天}
  ```
- [ ] Claude API 整合（Prompt 工程）
- [ ] 智慧分類引擎（10 大分類）
  ```
  餐飲、交通、娛樂、購物、居住、
  醫療、教育、訂閱、其他、收入
  ```
- [ ] 手動修正介面（AI 錯誤時）

#### Week 5-6：訂閱管理
- [ ] 訂閱列表頁（卡片式設計）
- [ ] 新增/編輯訂閱
- [ ] 自動標記「即將扣款」
- [ ] 月度訂閱總額顯示

#### Week 7：資料視覺化
- [ ] 本月支出總覽（大數字 + 趨勢）
- [ ] 分類占比圓餅圖
- [ ] 每日支出折線圖（近 30 天）

#### Week 8：優化與測試
- [ ] 效能優化（< 2s 首屏載入）
- [ ] 錯誤處理（網路失敗、AI 超時）
- [ ] 內部測試（5-10 位用戶）

### MVP 不做的事（刻意省略）
❌ 收入記錄（僅追蹤支出）
❌ 預算功能（先記帳，再談預算）
❌ Telegram Bot（V1.1 再做）
❌ AI 洞察報告（需累積資料）
❌ 匯出功能（非核心需求）
❌ 多幣別支援（僅 TWD）
❌ 照片上傳（降低複雜度）

### MVP 成功標準

**定量指標：**
- 20 位種子用戶完成註冊
- 平均每用戶記帳 ≥ 15 筆/週
- AI 分類準確率 ≥ 90%
- 7 日留存率 ≥ 60%

**定性指標：**
- 5 位用戶訪談正面回饋 ≥ 80%
- NPS 分數 ≥ 40
- 用戶自發分享 ≥ 3 次

### 開發團隊配置建議
```
1 位全端工程師（Next.js + PostgreSQL）
1 位 UI/UX 設計師（兼前端切版）
1 位產品經理（需求 + 測試）

預算：約 60-80 萬（2 個月）
```

---

## 5️⃣ 成功指標體系

### North Star Metric（北極星指標）
**「每週活躍記帳用戶數」（Weekly Active Recorders）**

為什麼選這個？
- 記帳頻率 = 產品價值實現
- 週為單位符合理財習慣
- 比單純 DAU 更能反映用戶投入度

### AARRR 海盜指標

#### 1. Acquisition（獲取）
| 指標 | 目標值（3個月） | 追蹤工具 |
|------|----------------|----------|
| 官網訪客數 | 2,000 | Google Analytics |
| 註冊轉化率 | ≥ 25% | Mixpanel |
| 主要流量來源 | 社群媒體 60% | UTM 參數 |
| CAC（獲客成本） | < $50/人 | 廣告平台 |

**關鍵行動：**
- 在 Dcard、PTT 發開箱文
- 製作「1 分鐘記帳挑戰」短影片

#### 2. Activation（激活）
| 指標 | 目標值 | 定義 |
|------|--------|------|
| Aha Moment 到達率 | ≥ 70% | 完成首次 AI 記帳 |
| 新用戶 3 日記帳數 | ≥ 5 筆 | 關鍵習慣養成 |
| 訂閱新增數 | ≥ 2 個 | 發現核心價值 |
| Onboarding 完成率 | ≥ 85% | 引導流程順暢度 |

**Aha Moment 設計：**
```
用戶輸入「早餐 65」後：
1. 立即顯示分類結果（< 1s）
2. 彈出提示：「✨ 看！不用選分類，AI 都懂」
3. 鼓勵再試一次：「試試看輸入『昨天電影 320』」
```

#### 3. Retention（留存）
| 時間點 | 目標留存率 | 行業基準 |
|--------|-----------|---------|
| 次日留存 | 50% | 40% |
| 7 日留存 | 35% | 25% |
| 30 日留存 | 20% | 15% |
| 90 日留存 | 15% | - |

**留存策略：**
- Day 3：推播「你已記帳 X 筆，查看本週花費」
- Day 7：Email「你的第一份週報出爐了！」
- Day 30：解鎖「月度 AI 洞察」功能

**流失預警：**
```sql
-- 3 日未記帳用戶
SELECT user_id FROM users
WHERE last_expense_date < NOW() - INTERVAL '3 days'
  AND status = 'active';
```
→ 觸發「我們想念你」推播

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
| 指標 | 目標值 | 機制 |
|------|--------|------|
| NPS 分數 | ≥ 50 | 每月調查 |
| 病毒係數（K 值） | ≥ 0.3 | 邀請功能 |
| 自然分享率 | ≥ 5% | 社群提及追蹤 |

**推薦機制設計：**
```
「邀請好友，雙方都獲得進階功能 1 個月」
- 分享連結 → 好友註冊 → 自動解鎖
- 目標：每位用戶邀請 ≥ 1 人
```

### 產品健康度儀表板

**每日監控：**
```
📊 今日新增記帳：XXX 筆
👥 活躍用戶：XXX 人（WAU：XXX）
🤖 AI 準確率：XX%（需人工修正率：XX%）
⚡ P95 回應時間：XXX ms
🐛 錯誤率：XX%
```

**每週覆盤：**
- 用戶訪談（3-5 位）
- Hotjar 錄影分析（發現卡點）
- Feature Request 整理（Canny.io）

### 成功里程碑

**Month 1：產品驗證**
- ✅ 100 位註冊用戶
- ✅ 7 日留存 ≥ 30%
- ✅ AI 準確率 ≥ 85%

**Month 2：習慣養成**
- ✅ 500 位註冊用戶
- ✅ WAU ≥ 200
- ✅ 7 日留存 ≥ 35%

**Month 3：增長驗證**
- ✅ 1,000 位註冊用戶
- ✅ WAU ≥ 400
- ✅ NPS ≥ 40
- ✅ 自然成長率 ≥ 20%（無付費廣告）

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

4. **商業模式待驗證**
   先免費累積用戶，再用數據決定付費功能

### 關鍵風險

⚠️ **最大風險：AI 成本**
如果 DAU 達 1,000，每人每日記帳 5 筆 → 月成本約 $225
緩解：設置速率限制 + 快取常見分類

⚠️ **次要風險：習慣養成失敗**
記帳本質上是反人性的，即使簡化仍可能放棄
緩解：Gamification（連續記帳徽章、成就系統）

### 下一步行動（按優先順序）

1. **技術原型驗證**（1 週）
   - 建立 Claude API 測試，驗證中文解析準確率
   - 設計 3 個核心頁面 Wireframe

2. **種子用戶招募**（同步進行）
   - 在社群發問卷，篩選 20 位測試用戶
   - 建立用戶訪談計畫

3. **開發排程確認**（1 週內）
   - 確認技術團隊組成
   - 設定每週 Sprint Review

4. **啟動開發**（Week 1）
   - 按照 MVP 8 週計畫執行
   - 每 2 週發布測試版給種子用戶

---

**文件版本：v1.0**
**最後更新：2025-10-20**
**維護者：產品經理團隊**
