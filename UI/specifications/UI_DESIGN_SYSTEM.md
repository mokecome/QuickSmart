# QuickSmart 智能記帳 - UI 設計系統

**版本**: v1.0
**日期**: 2025-10-21
**基於**: PRD_SDD.md, user_story.md, EVENT_STORMING.md

---

## 📋 目錄

1. [設計原則](#設計原則)
2. [色彩系統](#色彩系統)
3. [字體系統](#字體系統)
4. [間距系統](#間距系統)
5. [組件庫](#組件庫)
6. [圖示系統](#圖示系統)
7. [動畫規範](#動畫規範)
8. [響應式設計](#響應式設計)
9. [無障礙設計](#無障礙設計)
10. [品質檢查清單](#品質檢查清單)

---

## 🎨 設計原則

### 核心理念
**"簡單、快速、智能"**

1. **極簡主義** (Minimalism)
   - 移除不必要的元素
   - 每個畫面專注一個核心任務
   - 優先展示最重要的資訊

2. **即時反饋** (Instant Feedback)
   - 所有操作都有視覺反饋
   - 成功/錯誤狀態清晰可見
   - 載入狀態明確提示

3. **漸進揭示** (Progressive Disclosure)
   - 初始只顯示必要資訊
   - 進階功能隱藏在次要入口
   - 根據用戶熟練度調整介面

4. **一致性** (Consistency)
   - 相同操作在所有頁面保持一致
   - 視覺語言統一
   - 互動模式可預測

---

## 🎨 色彩系統

### 主要色彩

```css
/* 主色 (Primary) - 藍色 */
--color-primary-50:  #E3F2FD;
--color-primary-100: #BBDEFB;
--color-primary-200: #90CAF9;
--color-primary-300: #64B5F6;
--color-primary-400: #42A5F5;
--color-primary-500: #4A90E2; /* 主色 */
--color-primary-600: #1E88E5;
--color-primary-700: #1976D2;
--color-primary-800: #1565C0;
--color-primary-900: #0D47A1;

/* 次要色 (Secondary) - 綠色 */
--color-secondary-50:  #E8F5E9;
--color-secondary-100: #C8E6C9;
--color-secondary-200: #A5D6A7;
--color-secondary-300: #81C784;
--color-secondary-400: #66BB6A;
--color-secondary-500: #50C878; /* 次要色 */
--color-secondary-600: #43A047;
--color-secondary-700: #388E3C;
--color-secondary-800: #2E7D32;
--color-secondary-900: #1B5E20;
```

### 功能色彩

```css
/* 成功 (Success) */
--color-success: #4CAF50;
--color-success-light: #E8F5E9;
--color-success-dark: #2E7D32;

/* 警告 (Warning) */
--color-warning: #FFA500;
--color-warning-light: #FFF3E0;
--color-warning-dark: #E65100;

/* 錯誤 (Error) */
--color-error: #E74C3C;
--color-error-light: #FFEBEE;
--color-error-dark: #C62828;

/* 資訊 (Info) */
--color-info: #2196F3;
--color-info-light: #E3F2FD;
--color-info-dark: #1565C0;
```

### 中性色彩

```css
/* 文字 */
--color-text-primary: #333333;
--color-text-secondary: #666666;
--color-text-tertiary: #999999;
--color-text-disabled: #CCCCCC;

/* 背景 */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F8F9FA;
--color-bg-tertiary: #F0F4F8;
--color-bg-hover: #E8EAED;

/* 邊框 */
--color-border-light: #E0E0E0;
--color-border-medium: #BDBDBD;
--color-border-dark: #9E9E9E;

/* 陰影 */
--color-shadow-sm: rgba(0, 0, 0, 0.08);
--color-shadow-md: rgba(0, 0, 0, 0.12);
--color-shadow-lg: rgba(0, 0, 0, 0.16);
```

### 分類專屬色彩

```css
/* 支出分類 */
--color-category-food: #FF6B6B;         /* 🍽️ 餐飲 */
--color-category-transport: #4ECDC4;    /* 🚇 交通 */
--color-category-shopping: #FFD93D;     /* 🛍️ 購物 */
--color-category-entertainment: #A8E6CF;/* 📺 娛樂 */
--color-category-housing: #95A5A6;      /* 🏠 居住 */
--color-category-medical: #E74C3C;      /* 💊 醫療 */
--color-category-education: #3498DB;    /* 📚 教育 */
--color-category-subscription: #9B59B6; /* 📅 訂閱 */
--color-category-other: #7F8C8D;        /* ❓ 其他 */
--color-category-income: #27AE60;       /* 💰 收入 */
```

### 色彩使用規範

| 元素 | 色彩 | 使用場景 |
|------|------|----------|
| 主要按鈕 | Primary 500 | 確認、提交 |
| 次要按鈕 | 透明 + Primary 600 邊框 | 取消、返回 |
| 成功提示 | Success | 記帳成功、操作完成 |
| 警告提示 | Warning | 即將扣款、低信心度 |
| 錯誤提示 | Error | 驗證失敗、系統錯誤 |
| 連結文字 | Primary 600 | 可點擊連結 |
| 標題文字 | Text Primary | H1-H3 |
| 正文文字 | Text Secondary | Body, Paragraph |

---

## 🔤 字體系統

### 字體家族

```css
/* 主要字體 (西文 + 中文) */
--font-family-base: -apple-system, BlinkMacSystemFont,
                     "Segoe UI", Roboto, "Helvetica Neue",
                     "PingFang TC", "Microsoft JhengHei",
                     "Noto Sans TC", sans-serif;

/* 等寬字體 (數字) */
--font-family-mono: "SF Mono", Consolas, Monaco,
                     "Courier New", monospace;
```

### 字體大小

```css
/* Display - 大標題 */
--font-size-display: 32px;
--line-height-display: 1.2;
--font-weight-display: 700;

/* Heading 1 */
--font-size-h1: 24px;
--line-height-h1: 1.3;
--font-weight-h1: 700;

/* Heading 2 */
--font-size-h2: 20px;
--line-height-h2: 1.4;
--font-weight-h2: 600;

/* Heading 3 */
--font-size-h3: 18px;
--line-height-h3: 1.4;
--font-weight-h3: 600;

/* Body - 正文 */
--font-size-body: 16px;
--line-height-body: 1.5;
--font-weight-body: 400;

/* Small - 小字 */
--font-size-small: 14px;
--line-height-small: 1.5;
--font-weight-small: 400;

/* Tiny - 極小字 */
--font-size-tiny: 12px;
--line-height-tiny: 1.4;
--font-weight-tiny: 400;
```

### 字重規範

```css
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 使用範例

```html
<h1 class="text-display">NT$ 15,000</h1>
<h2 class="text-h1">本月支出</h2>
<p class="text-body">你的飲食支出佔總支出 40%</p>
<span class="text-small">2025-10-21</span>
<span class="text-tiny text-secondary">AI 分析</span>
```

---

## 📐 間距系統

### 基準間距 (8px Grid)

```css
--space-0: 0;
--space-1: 4px;   /* 0.5x */
--space-2: 8px;   /* 1x - 基準 */
--space-3: 12px;  /* 1.5x */
--space-4: 16px;  /* 2x */
--space-5: 20px;  /* 2.5x */
--space-6: 24px;  /* 3x */
--space-8: 32px;  /* 4x */
--space-10: 40px; /* 5x */
--space-12: 48px; /* 6x */
--space-16: 64px; /* 8x */
```

### 使用規範

| 元素 | 間距 | 範例 |
|------|------|------|
| 組件內邊距 | 16px | 卡片內邊距 |
| 組件間距 | 12px | 卡片之間 |
| 區塊間距 | 24px | 不同區塊 |
| 頁面邊距 | 16px | 左右留白 |
| 標題間距 | 8px | 標題下方 |
| 段落間距 | 12px | 段落之間 |

### 間距範例

```css
/* 卡片 */
.card {
  padding: var(--space-4);      /* 內邊距 16px */
  margin-bottom: var(--space-3); /* 間距 12px */
  border-radius: var(--space-2); /* 圓角 8px */
}

/* 頁面容器 */
.page-container {
  padding: var(--space-4);       /* 左右 16px */
  padding-top: var(--space-6);   /* 上方 24px */
}

/* 區塊標題 */
.section-title {
  margin-bottom: var(--space-2); /* 下方 8px */
}
```

---

## 🧩 組件庫

### 按鈕 (Button)

#### 主要按鈕
```html
<button class="btn btn-primary">
  確認
</button>
```

```css
.btn-primary {
  padding: 12px 24px;
  background-color: var(--color-primary-500);
  color: #FFFFFF;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  box-shadow: 0 2px 8px var(--color-shadow-sm);
  transition: all 200ms ease-out;
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--color-shadow-md);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: var(--color-text-disabled);
  cursor: not-allowed;
  box-shadow: none;
}
```

#### 次要按鈕
```css
.btn-secondary {
  padding: 12px 24px;
  background-color: transparent;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-500);
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
}

.btn-secondary:hover {
  background-color: var(--color-primary-50);
}
```

#### 危險按鈕
```css
.btn-danger {
  background-color: var(--color-error);
  color: #FFFFFF;
}

.btn-danger:hover {
  background-color: var(--color-error-dark);
}
```

---

### 輸入框 (Input)

```html
<div class="input-wrapper">
  <input
    type="text"
    class="input"
    placeholder="試試看: 早餐 65"
  />
</div>
```

```css
.input {
  width: 100%;
  height: 56px;
  padding: 16px;
  font-size: 18px;
  border: 2px solid var(--color-border-light);
  border-radius: 12px;
  background-color: var(--color-bg-secondary);
  transition: all 200ms ease-out;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  background-color: #FFFFFF;
  box-shadow: 0 2px 8px var(--color-shadow-sm);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}

.input:disabled {
  background-color: var(--color-bg-tertiary);
  cursor: not-allowed;
}

/* 錯誤狀態 */
.input.error {
  border-color: var(--color-error);
}
```

---

### 卡片 (Card)

```html
<div class="card">
  <div class="card-header">
    <h3>標題</h3>
  </div>
  <div class="card-body">
    內容
  </div>
</div>
```

```css
.card {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px var(--color-shadow-sm);
  transition: all 200ms ease-out;
}

.card:hover {
  box-shadow: 0 4px 12px var(--color-shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-light);
}

.card-body {
  padding-top: 12px;
}
```

---

### 開關切換 (Toggle Switch)

```html
<label class="toggle">
  <input type="checkbox" class="toggle-input" />
  <span class="toggle-slider"></span>
  <span class="toggle-label">訂閱提醒</span>
</label>
```

```css
.toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 48px;
  height: 28px;
  background-color: var(--color-text-disabled);
  border-radius: 14px;
  transition: background-color 200ms;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  left: 2px;
  top: 2px;
  background-color: #FFFFFF;
  border-radius: 12px;
  transition: transform 200ms;
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--color-success);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}
```

---

### 標籤 (Badge)

```html
<span class="badge badge-success">新</span>
<span class="badge badge-warning">即將扣款</span>
<span class="badge badge-error">錯誤</span>
```

```css
.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
}

.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.badge-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}
```

---

### 進度條 (Progress Bar)

```html
<div class="progress">
  <div class="progress-bar" style="width: 40%"></div>
</div>
```

```css
.progress {
  width: 100%;
  height: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--color-primary-500);
  transition: width 400ms ease-out;
}
```

---

### 提示框 (Toast)

```html
<div class="toast toast-success">
  <span class="toast-icon">✅</span>
  <span class="toast-message">已記帳!</span>
</div>
```

```css
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 16px var(--color-shadow-md);
  z-index: 1000;
  animation: toast-slide-in 300ms ease-out;
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast-success {
  border-left: 4px solid var(--color-success);
}

.toast-error {
  border-left: 4px solid var(--color-error);
}
```

---

## 🎭 圖示系統

### 圖示來源
1. **分類圖示**: 優先使用 Emoji (🍽️, 🚇, 🛍️)
2. **操作圖示**: Material Icons / Lucide Icons
3. **自訂圖示**: SVG (品牌 Logo)

### 圖示大小規範

```css
--icon-size-xs: 16px;
--icon-size-sm: 20px;
--icon-size-md: 24px;
--icon-size-lg: 32px;
--icon-size-xl: 48px;
```

### 使用範例

```html
<!-- Emoji 圖示 -->
<span class="icon-emoji">🍽️</span>

<!-- SVG 圖示 -->
<svg class="icon" width="24" height="24">
  <use href="#icon-arrow-right"></use>
</svg>
```

---

## 🎬 動畫規範

### 緩動函數 (Easing)

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 動畫時長

```css
--duration-instant: 100ms;  /* 微互動 */
--duration-fast: 200ms;     /* 標準過渡 */
--duration-normal: 300ms;   /* 普通動畫 */
--duration-slow: 400ms;     /* 複雜動畫 */
--duration-slower: 600ms;   /* 進入/離開 */
```

### 常用動畫

#### 淡入淡出
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

#### 滑入滑出
```css
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
```

#### 彈簧效果
```css
@keyframes spring {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
```

### 動畫最佳實踐
1. 優先使用 `transform` 和 `opacity`
2. 避免 `width`, `height`, `top`, `left`
3. 使用 `will-change` 提示瀏覽器
4. 動畫結束後移除 `will-change`

---

## 📱 響應式設計

### 斷點系統

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* 小型手機 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小型桌面 */
--breakpoint-xl: 1280px;  /* 大型桌面 */
```

### 媒體查詢範例

```css
/* 基礎樣式 (Mobile) */
.container {
  padding: 16px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 720px;
    margin: 0 auto;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 960px;
  }
}
```

### 觸控優化
- 最小觸控區域: 44px × 44px (iOS 標準)
- 元素間距: 至少 8px
- 字體最小: 14px (避免自動縮放)

---

## ♿ 無障礙設計

### 色彩對比度

遵循 WCAG 2.1 AA 標準:
- 正文文字: 至少 4.5:1
- 大文字 (≥18px): 至少 3:1
- UI 組件: 至少 3:1

### 鍵盤導航

```html
<!-- 可聚焦元素 -->
<button tabindex="0">按鈕</button>

<!-- 跳過內容 -->
<a href="#main-content" class="skip-link">
  跳到主要內容
</a>

<!-- 焦點指示 -->
<style>
  :focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
</style>
```

### ARIA 標籤

```html
<!-- 語意化 HTML -->
<main aria-label="主要內容">
  <section aria-labelledby="section-title">
    <h2 id="section-title">標題</h2>
  </section>
</main>

<!-- 動態內容 -->
<div role="status" aria-live="polite">
  已記帳!
</div>

<!-- 互動元素 -->
<button aria-label="關閉對話框" aria-pressed="false">
  <span aria-hidden="true">×</span>
</button>
```

---

## ✅ 品質檢查清單

### 視覺設計
- [ ] 色彩對比度符合 WCAG AA
- [ ] 字體大小 ≥ 14px
- [ ] 觸控區域 ≥ 44px × 44px
- [ ] 一致的間距 (8px 基準)
- [ ] 統一的圓角 (8px, 12px, 24px)
- [ ] 適當的陰影層級

### 互動體驗
- [ ] 所有按鈕有懸停狀態
- [ ] 所有按鈕有按下反饋
- [ ] 輸入框有聚焦狀態
- [ ] 載入狀態明確
- [ ] 錯誤訊息清楚
- [ ] 成功反饋及時

### 響應式
- [ ] Mobile (375px) 正常顯示
- [ ] Tablet (768px) 正常顯示
- [ ] Desktop (1920px) 正常顯示
- [ ] 橫屏模式正常
- [ ] 文字不溢出
- [ ] 圖片自適應

### 無障礙
- [ ] 可用鍵盤完整操作
- [ ] 焦點順序合理
- [ ] 螢幕閱讀器友善
- [ ] ARIA 標籤正確
- [ ] 色盲模式可用
- [ ] 高對比模式支援

### 效能
- [ ] 首屏載入 < 2s
- [ ] 互動響應 < 100ms
- [ ] 動畫 60 FPS
- [ ] 圖片已優化
- [ ] CSS/JS 已壓縮

---

## 📚 參考資源

### 設計工具
- **Figma**: UI 設計與原型
- **Sketch**: macOS UI 設計
- **Adobe XD**: 跨平台設計

### 圖示庫
- **Material Icons**: https://fonts.google.com/icons
- **Lucide**: https://lucide.dev
- **Heroicons**: https://heroicons.com

### 色彩工具
- **Coolors**: https://coolors.co
- **Adobe Color**: https://color.adobe.com
- **Contrast Checker**: https://webaim.org/resources/contrastchecker

### 字體資源
- **Google Fonts**: https://fonts.google.com
- **Adobe Fonts**: https://fonts.adobe.com

---

## 🔄 版本歷史

- **v1.0** (2025-10-21): 初始版本
  - 建立基礎色彩系統
  - 定義字體規範
  - 創建核心組件庫

### 下一版本計畫 (v1.1)
- 🔲 深色模式支援
- 🔲 更多動畫範例
- 🔲 組件變體擴充
- 🔲 主題定制系統

---

**維護者**: UI/UX 團隊
**更新頻率**: 每月審查
**問題回報**: design@quicksmart.app

**相關文件**:
- [快速記帳 UI](../wireframes/01_quick_expense_input.md)
- [訂閱管理 UI](../wireframes/02_subscription_management.md)
- [Onboarding UI](../wireframes/03_onboarding_flow.md)
- [分析洞察 UI](../wireframes/04_analytics_insights.md)
- [設定頁面 UI](../wireframes/05_settings.md)
