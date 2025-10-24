# QuickSmart 智能記帳 API 文檔

完整的 REST API 端點文檔,包含所有已實現的功能。

## 📋 目錄

- [認證 (Authentication)](#認證-authentication)
- [支出管理 (Expenses)](#支出管理-expenses)
- [訂閱管理 (Subscriptions)](#訂閱管理-subscriptions)
- [智能分析 (Analytics & Insights)](#智能分析-analytics--insights)
- [通知管理 (Notifications)](#通知管理-notifications)

## 🔐 認證 (Authentication)

所有 API 端點（除了認證相關）都需要在 HTTP Headers 中包含 Supabase 認證 token。

### OAuth Callback

處理 Google OAuth 登入回調

**Endpoint**: `GET /api/auth/callback`

**Query Parameters**:
- `code` (string): OAuth authorization code

**Response**:
```
Redirect to: / (成功)
Redirect to: /login?error=auth_failed (失敗)
```

**實現的 User Story**: US-005

---

### Sign Out

登出當前用戶

**Endpoint**: `POST /api/auth/signout`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "success": true
}
```

**實現的 User Story**: US-005

---

### Get Session

獲取當前用戶會話

**Endpoint**: `GET /api/auth/session`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "session": {
    "user": { ... },
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

**Errors**:
- `401 Unauthorized`: No active session

**實現的 User Story**: US-005

---

## 💰 支出管理 (Expenses)

### Parse Expense Input

使用 AI 解析自然語言輸入

**Endpoint**: `POST /api/expenses/parse`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "input": "午餐 150"
}
```

**Response**: `200 OK`
```json
{
  "amount": 150,
  "category": "FOOD",
  "description": "午餐",
  "confidence": 95,
  "fallbackUsed": false
}
```

**Categories**:
- `FOOD`: 飲食
- `TRANSPORT`: 交通
- `ENTERTAINMENT`: 娛樂
- `SHOPPING`: 購物
- `HOUSING`: 居住
- `MEDICAL`: 醫療
- `EDUCATION`: 教育
- `SUBSCRIPTION`: 訂閱
- `OTHER`: 其他
- `INCOME`: 收入

**實現的 User Story**: US-001 (AI 解析), US-002 (備用解析)

---

### List Expenses

獲取用戶的支出列表（分頁）

**Endpoint**: `GET /api/expenses`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `page` (number, optional): 頁碼，默認 1
- `limit` (number, optional): 每頁數量，默認 20
- `category` (string, optional): 按類別篩選
- `startDate` (ISO string, optional): 開始日期
- `endDate` (ISO string, optional): 結束日期
- `search` (string, optional): 搜尋描述

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "amount": 150,
      "category": "FOOD",
      "description": "午餐",
      "date": "2025-01-24T12:00:00Z",
      "ai_confidence": 95,
      "fallback_used": false,
      "version": 1,
      "created_at": "2025-01-24T12:00:00Z",
      "updated_at": "2025-01-24T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**實現的 User Story**: US-004

---

### Create Expense

創建新的支出記錄

**Endpoint**: `POST /api/expenses`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 150,
  "category": "FOOD",
  "description": "午餐",
  "date": "2025-01-24T12:00:00Z",
  "aiConfidence": 95,
  "fallbackUsed": false
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 150,
    "category": "FOOD",
    "description": "午餐",
    "date": "2025-01-24T12:00:00Z",
    ...
  }
}
```

**實現的 User Story**: US-004

---

### Get Expense by ID

獲取單一支出記錄

**Endpoint**: `GET /api/expenses/{id}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

**Errors**:
- `404 Not Found`: Expense not found

**實現的 User Story**: US-004

---

### Update Expense

更新支出記錄（支持樂觀鎖）

**Endpoint**: `PATCH /api/expenses/{id}`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 200,
  "category": "FOOD",
  "description": "午餐 (已更新)",
  "version": 1
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "version": 2,
    ...
  }
}
```

**Errors**:
- `409 Conflict`: Version conflict (另一設備已更新)

**實現的 User Story**: US-004, US-030 (多設備同步)

---

### Delete Expense

軟刪除支出記錄

**Endpoint**: `DELETE /api/expenses/{id}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "success": true
}
```

**實現的 User Story**: US-004

---

### Correct Expense Category

保存用戶對分類的修正（用於 AI 學習）

**Endpoint**: `POST /api/expenses/correct`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "originalInput": "午餐 150",
  "originalCategory": "OTHER",
  "correctedCategory": "FOOD",
  "expenseId": "uuid"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "original_input": "午餐 150",
    "original_category": "OTHER",
    "corrected_category": "FOOD",
    ...
  }
}
```

**實現的 User Story**: US-003 (個人化學習與修正)

---

## 📅 訂閱管理 (Subscriptions)

### List Subscriptions

獲取用戶的訂閱列表

**Endpoint**: `GET /api/subscriptions`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `status` (string, optional): 按狀態篩選 (ACTIVE, PAUSED, CANCELLED)

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Netflix",
      "amount": 390,
      "billing_cycle": "MONTHLY",
      "next_billing_date": "2025-02-01T00:00:00Z",
      "reminder_days": [3, 1, 0],
      "status": "ACTIVE",
      "auto_record": true,
      "notes": null,
      "created_at": "2025-01-24T12:00:00Z",
      "updated_at": "2025-01-24T12:00:00Z"
    }
  ]
}
```

**實現的 User Story**: US-010

---

### Create Subscription

創建新的訂閱

**Endpoint**: `POST /api/subscriptions`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Netflix",
  "amount": 390,
  "billingCycle": "MONTHLY",
  "nextBillingDate": "2025-02-01",
  "reminderDays": [3, 1, 0],
  "autoRecord": true,
  "notes": "家庭方案"
}
```

**Billing Cycles**:
- `WEEKLY`: 每週
- `MONTHLY`: 每月
- `QUARTERLY`: 每季
- `YEARLY`: 每年

**Response**: `201 Created`
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

**實現的 User Story**: US-010

---

### Get Subscription by ID

獲取單一訂閱

**Endpoint**: `GET /api/subscriptions/{id}`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

**實現的 User Story**: US-010

---

### Update Subscription

更新訂閱資訊

**Endpoint**: `PATCH /api/subscriptions/{id}`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Netflix Premium",
  "amount": 490,
  "notes": "升級到 4K 方案"
}
```

**Response**: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

**實現的 User Story**: US-012

---

### Cancel Subscription

取消訂閱

**Endpoint**: `POST /api/subscriptions/{id}/cancel`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CANCELLED",
    ...
  }
}
```

**實現的 User Story**: US-013

---

### Pause/Resume Subscription

暫停或恢復訂閱

**Endpoint**: `POST /api/subscriptions/{id}/pause`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "action": "pause"
}
```

**Action Values**:
- `pause`: 暫停訂閱
- `resume`: 恢復訂閱

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PAUSED",
    ...
  }
}
```

**實現的 User Story**: US-013

---

### Get Subscription Summary

獲取訂閱統計摘要

**Endpoint**: `GET /api/subscriptions/summary`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "data": {
    "totalSubscriptions": 5,
    "activeSubscriptions": 4,
    "pausedSubscriptions": 1,
    "monthlyTotal": 1500.00,
    "yearlyTotal": 18000.00,
    "upcomingBillings": [
      {
        "id": "uuid",
        "name": "Netflix",
        "amount": 390,
        "nextBillingDate": "2025-02-01T00:00:00Z"
      }
    ],
    "subscriptions": [ ... ]
  }
}
```

**實現的 User Story**: US-010

---

## 📊 智能分析 (Analytics & Insights)

### Get Monthly Analytics

獲取月度消費分析

**Endpoint**: `GET /api/analytics/monthly`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `year` (number): 年份
- `month` (number): 月份 (1-12)

**Response**: `200 OK`
```json
{
  "data": {
    "totalExpenses": 15000.00,
    "totalIncome": 50000.00,
    "netAmount": 35000.00,
    "transactionCount": 120,
    "byCategory": {
      "FOOD": {
        "amount": 5000.00,
        "count": 45
      },
      "TRANSPORT": {
        "amount": 2000.00,
        "count": 30
      }
    },
    "dailyTotals": {
      "2025-01-01": 500.00,
      "2025-01-02": 300.00
    }
  }
}
```

**Note**: 結果會被緩存 24 小時以提升性能

**實現的 User Story**: US-014, US-020

---

### Analyze Spending Trends

分析消費趨勢

**Endpoint**: `GET /api/insights/trends`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `months` (number, optional): 分析月數，默認 6
- `category` (string, optional): 指定分類

**Response**: `200 OK`
```json
{
  "data": {
    "monthlyTrends": [
      {
        "month": "2024-08",
        "total": 12000.00,
        "count": 95,
        "average": 126.32,
        "changePercent": 5.2
      },
      {
        "month": "2024-09",
        "total": 13500.00,
        "count": 102,
        "average": 132.35,
        "changePercent": 12.5
      }
    ],
    "categoryBreakdown": [
      {
        "category": "FOOD",
        "total": 5000.00,
        "percentage": 37.04
      }
    ],
    "statistics": {
      "totalSpent": 75000.00,
      "averageMonthly": 12500.00,
      "lastMonthTotal": 13500.00,
      "trendDirection": "increasing"
    },
    "metadata": {
      "startDate": "2024-08-01T00:00:00Z",
      "endDate": "2025-01-24T00:00:00Z",
      "months": 6,
      "category": "all"
    }
  }
}
```

**實現的 User Story**: US-020

---

### Detect Spending Anomalies

偵測異常消費

**Endpoint**: `GET /api/insights/anomalies`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `days` (number, optional): 分析天數，默認 30
- `threshold` (number, optional): 標準差閾值，默認 2.0

**Response**: `200 OK`
```json
{
  "data": {
    "anomalousExpenses": [
      {
        "id": "uuid",
        "amount": 5000.00,
        "category": "SHOPPING",
        "description": "購買新電腦",
        "date": "2025-01-20T00:00:00Z",
        "expectedAmount": 500.00,
        "deviation": 4500.00,
        "zScore": 3.2,
        "severity": "high"
      }
    ],
    "unusualDays": [
      {
        "date": "2025-01-20",
        "total": 6000.00,
        "expectedTotal": 1000.00,
        "deviation": 5000.00,
        "zScore": 2.8
      }
    ],
    "statistics": {
      "totalExpensesAnalyzed": 350,
      "anomaliesDetected": 5,
      "unusualDaysDetected": 2,
      "threshold": 2.0,
      "baselinePeriodDays": 90,
      "analysisPeriodDays": 30
    },
    "baselineStats": [
      {
        "category": "FOOD",
        "averageAmount": 150.00,
        "standardDeviation": 50.00,
        "sampleSize": 85
      }
    ]
  }
}
```

**Severity Levels**:
- `high`: Z-score >= 3.0
- `medium`: Z-score >= 2.5
- `low`: Z-score >= 2.0

**實現的 User Story**: US-021

---

## 🔔 通知管理 (Notifications)

### List Notifications

獲取通知列表

**Endpoint**: `GET /api/notifications`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `page` (number, optional): 頁碼，默認 1
- `limit` (number, optional): 每頁數量，默認 20
- `unreadOnly` (boolean, optional): 只顯示未讀，默認 false

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "SUBSCRIPTION_REMINDER",
      "title": "訂閱扣款提醒",
      "message": "您的 Netflix 訂閱明天將扣款 $390",
      "related_id": "uuid",
      "read": false,
      "read_at": null,
      "scheduled_for": null,
      "created_at": "2025-01-24T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**Notification Types**:
- `SUBSCRIPTION_REMINDER`: 訂閱提醒
- `ANOMALY_DETECTED`: 異常消費偵測
- `BUDGET_ALERT`: 預算警告
- `MONTHLY_SUMMARY`: 月度總結
- `SYSTEM`: 系統通知

**實現的 User Story**: US-015

---

### Create Notification

創建通知（內部使用）

**Endpoint**: `POST /api/notifications`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "SUBSCRIPTION_REMINDER",
  "title": "訂閱扣款提醒",
  "message": "您的 Netflix 訂閱明天將扣款 $390",
  "relatedId": "uuid",
  "scheduledFor": "2025-01-31T00:00:00Z"
}
```

**Response**: `201 Created`
```json
{
  "data": {
    "id": "uuid",
    ...
  }
}
```

**實現的 User Story**: US-015

---

### Mark Notification as Read

標記通知為已讀

**Endpoint**: `PATCH /api/notifications/{id}/read`

**Headers**:
```
Authorization: Bearer {token}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "read": true,
    "read_at": "2025-01-24T12:00:00Z",
    ...
  }
}
```

**實現的 User Story**: US-015

---

## 🤖 Supabase Edge Functions

這些函數會自動執行，不需要手動調用。

### Subscription Billing Check

**Function**: `subscription-billing-check`

**Schedule**: 每天執行一次

**功能**:
- 檢查即將到期的訂閱
- 創建提醒通知
- 自動記錄訂閱扣款
- 更新下次扣款日期

**實現的 User Story**: US-010, US-011

---

### Anomaly Detection

**Function**: `anomaly-detection`

**Schedule**: 每天執行一次

**功能**:
- 偵測異常消費模式
- 創建異常通知
- 基於統計分析（Z-score）

**實現的 User Story**: US-021

---

### Analytics Cache Refresh

**Function**: `analytics-cache-refresh`

**Schedule**: 每天執行一次

**功能**:
- 刷新月度分析緩存
- 清理過期緩存
- 提升查詢性能

**實現的 User Story**: US-020

---

## 📝 通用錯誤響應

所有 API 端點都遵循統一的錯誤響應格式：

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### HTTP Status Codes

- `200 OK`: 請求成功
- `201 Created`: 資源創建成功
- `400 Bad Request`: 請求參數錯誤
- `401 Unauthorized`: 未授權（未登入）
- `403 Forbidden`: 無權限訪問
- `404 Not Found`: 資源不存在
- `409 Conflict`: 資源衝突（如版本衝突）
- `429 Too Many Requests`: 請求頻率超限
- `500 Internal Server Error`: 服務器錯誤

---

## 🔒 安全性

1. **Row Level Security (RLS)**: 所有資料表都啟用 RLS，確保用戶只能訪問自己的數據
2. **Token Authentication**: 所有 API 都需要有效的 Supabase token
3. **Rate Limiting**:
   - 一般 API: 100 requests/min
   - AI 解析: 20 requests/min
   - 認證: 5 attempts/15min
4. **Input Validation**: 所有輸入都會經過驗證和清理
5. **Optimistic Locking**: 使用版本號防止多設備同時編輯衝突

---

## 📌 重要提示

1. **日期格式**: 所有日期使用 ISO 8601 格式 (YYYY-MM-DDTHH:mm:ss.sssZ)
2. **金額**: 所有金額使用數字類型，保留兩位小數
3. **分頁**: 默認每頁 20 條，最大 100 條
4. **緩存**: 月度分析數據會緩存 24 小時
5. **時區**: 所有時間戳使用 UTC

---

**Version**: 1.0.0
**Last Updated**: 2025-01-24
**Status**: ✅ All endpoints implemented and ready for use
