# 測試指南

## 🎯 當前應用狀態

### ✅ 已完成並可測試的功能

1. **前端界面**
   - 登入頁面 (http://localhost:3000/login)
   - 註冊頁面 (http://localhost:3000/register)
   - 首頁 (http://localhost:3000/)
   - 訂閱管理頁面 (http://localhost:3000/subscriptions)
   - 智能分析頁面 (http://localhost:3000/insights)

2. **認證系統**
   - ✅ 用戶註冊（Supabase Auth）
   - ✅ 用戶登入（Supabase Auth）
   - ✅ 登出功能
   - ⚠️ Google OAuth（已暫時停用）

3. **API 路由**
   - ✅ `/api/auth/register` - 註冊
   - ✅ `/api/auth/login` - 登入
   - ✅ `/api/auth/signout` - 登出
   - ✅ `/api/auth/session` - 取得 session
   - ✅ `/api/auth/callback` - OAuth 回調

## 🧪 測試步驟

### 第一步：註冊新用戶

1. 訪問 http://localhost:3000/register
2. 填寫註冊表單：
   - **姓名**：測試用戶（可選）
   - **電子郵件**：test@example.com
   - **密碼**：至少 6 個字元（例如：test123456）
   - **確認密碼**：與密碼相同
3. 點擊「註冊」按鈕

**預期結果：**
- ✅ 顯示「註冊成功！」提示
- ✅ 自動跳轉到首頁
- ✅ 在 Supabase Dashboard 的 Authentication > Users 中可以看到新用戶

**如果失敗：**
- ❌ 如果顯示「此電子郵件已被註冊」- 表示該郵箱已使用，請換一個郵箱
- ❌ 如果顯示「註冊失敗」- 檢查 `.env.local` 中的 Supabase 配置是否正確

### 第二步：登出並重新登入

1. 點擊右上角的「登出」按鈕
2. 應該會跳轉到登入頁面
3. 使用剛才註冊的帳號登入：
   - **電子郵件**：test@example.com
   - **密碼**：test123456
4. 點擊「登入」按鈕

**預期結果：**
- ✅ 顯示「登入成功！」提示
- ✅ 自動跳轉到首頁
- ✅ 右上角顯示用戶名和郵箱

**如果失敗：**
- ❌ 如果顯示「電子郵件或密碼錯誤」- 確認密碼輸入正確
- ❌ 如果持續失敗 - 重新註冊一個新帳號

### 第三步：測試頁面導航

測試所有頁面是否可以正常訪問：

1. **首頁** - http://localhost:3000/
   - 應該看到記帳輸入表單和近期交易列表

2. **訂閱管理** - http://localhost:3000/subscriptions
   - 應該看到訂閱列表（目前為空）

3. **智能分析** - http://localhost:3000/insights
   - 應該看到月度統計卡片和消費分布

**預期結果：**
- ✅ 所有頁面都能正常訪問
- ✅ Header 導航欄顯示正確
- ✅ 當前頁面高亮顯示

## ⚠️ 已知問題和限制

### 1. 數據庫表未創建
**問題：** Supabase 數據庫中沒有業務表（expenses, subscriptions 等）

**影響：**
- ❌ 無法保存支出記錄
- ❌ 無法創建訂閱
- ❌ 分析頁面無法顯示數據

**解決方案：**
執行 `supabase-schema.sql` 文件中的 SQL（參考 `SUPABASE_SETUP.md`）

### 2. 缺少 PWA 圖標
**問題：** `icon-192x192.png` 404 錯誤

**影響：**
- ⚠️ 瀏覽器 Console 顯示警告
- ⚠️ 不影響核心功能

**解決方案：**
- 暫時可以忽略
- 或創建簡單的 PWA 圖標

### 3. Google OAuth 已停用
**問題：** Supabase 中未配置 Google OAuth

**影響：**
- ⚠️ 無法使用 Google 登入
- ✅ 不影響郵箱密碼登入

**解決方案：**
- 使用郵箱密碼註冊/登入
- 或在 Supabase Dashboard 中啟用 Google OAuth

## 📊 測試檢查清單

### 基礎功能測試
- [ ] 可以訪問所有頁面
- [ ] 註冊新用戶成功
- [ ] 登入成功
- [ ] 登出成功
- [ ] Header 導航正常工作
- [ ] 頁面樣式正確顯示

### 認證流程測試
- [ ] 未登入時訪問首頁會重定向到登入頁
- [ ] 登入後可以訪問所有頁面
- [ ] 登出後返回登入頁
- [ ] 錯誤密碼顯示正確錯誤信息
- [ ] 重複郵箱註冊顯示正確錯誤信息

### 用戶體驗測試
- [ ] 表單驗證正常工作
- [ ] Loading 狀態正確顯示
- [ ] Toast 通知正常顯示
- [ ] 響應式設計在不同設備上正常

## 🔍 調試技巧

### 查看控制台日誌
打開瀏覽器開發者工具 (F12)：
- **Console** - 查看 JavaScript 錯誤
- **Network** - 查看 API 請求和響應
- **Application > Local Storage** - 查看存儲的認證信息

### 查看服務器日誌
在運行 `npm run dev` 的終端中查看：
- API 請求日誌
- 編譯錯誤
- 運行時錯誤

### 檢查 Supabase
在 Supabase Dashboard 中：
- **Authentication > Users** - 查看註冊用戶
- **Table Editor** - 查看數據表（執行 SQL 後）
- **Logs** - 查看數據庫日誌

## 📝 測試數據建議

使用以下測試數據進行測試：

**測試用戶 1:**
- Email: alice@example.com
- Password: alice123456
- Name: Alice

**測試用戶 2:**
- Email: bob@example.com
- Password: bob123456
- Name: Bob

**測試支出記錄（執行 SQL 後）:**
- "早餐 50 元"
- "Uber 120 元"
- "Netflix 訂閱 390 元"

## 🚀 下一步

1. ✅ 完成 Supabase 數據庫設置（執行 `supabase-schema.sql`）
2. ✅ 測試完整的記帳功能
3. ✅ 測試訂閱管理功能
4. ✅ 測試智能分析功能
5. ✅ 配置 OpenAI API（用於 AI 記帳解析）

執行完數據庫設置後，所有功能都將完全可用！🎉
