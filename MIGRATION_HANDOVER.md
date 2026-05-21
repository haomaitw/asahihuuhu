# 專案交接與架構說明書

> **適用對象：** 接手本專案的 Google Gemini 代理人  
> **撰寫日期：** 2026-05-21  
> **撰寫者：** Claude（Anthropic）  
> **專案名稱：** 朝日夫婦 ASAHI HUUHU — 官方網站  
> **GitHub Repository：** `haomaitw/asahihuuhu`  
> **開發分支：** `claude/fix-critical-bugs-BoYt6`（PR #29）  
> **部署平台：** Zeabur（容器化 Next.js）

---

## 一、專案目前的開發狀態

### ✅ 已完成且可運作的功能

| 功能模組 | 說明 |
|---------|------|
| **Firebase 身份驗證** | 登入 / 登出 / Session cookie（`__session`，5 天有效），`verifySessionCookie` 驗證 |
| **三角色權限系統** | `super-admin`（全權）、`admin`（內容 + 訂單）、`staff`（僅訂單） |
| **商品管理（後台）** | 新增、編輯、刪除商品；多語言名稱、圖片上傳、庫存管理、SEO 欄位 |
| **商品分類管理** | CRUD，slug 欄位，商品以 slug 關聯（非 doc ID）|
| **訂單管理（後台）** | 列表檢視、狀態更新（付款 / 出貨）、物流編號填寫 |
| **ECPay 綠界金流** | 結帳建立訂單 → ECPay POST 送出 → callback 更新狀態 + 扣減庫存 |
| **最新消息管理** | 多語言文章、草稿/發佈、分類標籤 |
| **常見問答（FAQ）** | 多語言問答、自訂排序 |
| **用戶管理** | 列表、新增管理員、修改角色、停用帳號 |
| **個人資料頁** | 登入者可修改自己的名稱與密碼（`/admin/profile`） |
| **菜單 CMS（line-up）** | Firestore `menu-items` collection + 後台 CRUD 頁面；前台 line-up 頁優先讀 Firestore，空則 fallback 靜態資料 |
| **首頁 CMS** | 標語、Hero 影片、精選商品、季節影片 + 圖片區塊均可後台編輯 |
| **關於頁面（About）** | 完整品牌故事頁：Hero 影片 + 三段文字 + 圖片陣列，讀取 Firestore `settings/about-page` |
| **商店頁面（Shop）** | 商品網格、按分類篩選、加入購物車；需商品的 `category` 欄位儲存 slug |
| **購物車 + 結帳流程** | CartProvider（zustand）、Checkout → 建立 Firestore 訂單 → ECPay 跳轉 |
| **首頁菜單精選區塊** | 展示前 4 個有 badge 的菜單品項，See More 進入 `/line-up` |
| **網站設定** | 地址、電話、Line ID、Google Maps、社群連結、版權、黑貓寄送人資料、電子郵件設定、SEO 描述、favicon 上傳、OG Image 上傳 |
| **功能開關（Feature Flags）** | `maintenanceMode` 等全站開關，存於 `settings/feature-flags` |
| **媒體庫** | 上傳圖片 / 影片至 Firebase Storage，URL 存入 Firestore `media` collection |
| **多語言（next-intl）** | 支援 `zh-TW`、`en`、`ja`，路由前綴 `[locale]` |
| **動態 Favicon / OG Image** | `layout.tsx` 的 `generateMetadata()` 從 Firestore 讀取，後台可上傳更新 |

---

### ⚠️ 尚未完成或有已知問題的功能

| 功能模組 | 狀態 | 說明 |
|---------|------|------|
| **優惠券（Coupons）** | 部分完成 | 後台目錄存在（`/admin/collections/coupons/`）；API 路由已實作，但前台結帳的折扣計算邏輯需要驗證是否完整 |
| **顧客管理頁** | 有殘留舊代碼 | `CustomerDetailClient` 組件仍引用 Payload CMS 格式（已棄用），需重構為 Firebase Auth + Firestore 格式 |
| **內用/廚房管理** | Stub 目錄 | 路由目錄存在但頁面均為空殼（`/admin/dine-in/`、`/admin/kitchen/`），尚未實作 |
| **點數交易（points）** | Stub | `point-transactions` 相關路由目錄存在，邏輯未實作 |
| **Email 訂單確認信** | 未確認測試 | SMTP 設定已在後台（Lark Suite），`nodemailer` 已安裝，訂單 callback 理論上會寄信，但沒有端對端驗證記錄 |
| **前台商品 slug 修正** | 需手動處理 | 舊版商品的 `category` 欄位存的是 Firestore doc ID（如 `abc123`），而非 slug（如 `goods`）。修正後的 ProductForm 已改存 slug，但既有商品需在後台重新儲存一次（或透過 Firestore Console 手動更新） |

---

## 二、Firestore 架構與連接方式

### 集合（Collections）

| Collection | 用途 | 主要欄位 |
|-----------|------|---------|
| `products` | 商品 | `name{LocalizedString}`, `slug`, `price`, `comparePrice`, `images[]`, `category`（slug 字串）, `stock`, `isAvailable`, `trackStock`, `seo` |
| `orders` | 訂單 | `orderNumber`, `customerName`, `customerEmail`, `customerPhone`, `status`, `fulfillmentStatus`, `items[]`, `totalAmount`, `ecpayTradeNo`, `paidAt` |
| `news` | 最新消息 | `title{LocalizedString}`, `slug`, `date`, `status`（`published`/`draft`）, `body` |
| `faqs` | 常見問答 | `question{LocalizedString}`, `answer{LocalizedString}`, `order` |
| `users` | 管理員帳號 | `email`, `name`, `role`（`super-admin`/`admin`/`staff`）, `createdAt` |
| `product-categories` | 商品分類 | `name{LocalizedString}`, `slug`, `order` |
| `news-categories` | 文章分類 | `name{LocalizedString}`, `slug` |
| `menu-items` | 菜單品項 | `name{LocalizedString}`, `category`（`kakigori`/`crepes`/`drinks`/`goods`）, `badge`（`new`/`seasonal`/null）, `order`, `isAvailable`, `image` |
| `media` | 媒體資產 | `url`, `filename`, `mimeType`, `size`, `createdAt` |
| `coupons` | 優惠券 | `code`, `discountType`, `discountValue`, `minOrderAmount`, `usageLimit`, `usageCount`, `validFrom`, `validTo`, `isActive` |
| `staff` | 員工資料（舊有，已從 Sidebar 隱藏） | `name{LocalizedString}`, `role`, `bio{LocalizedString}`, `image` |

### Settings 文件（單一文件，non-collection）

| Document 路徑 | 用途 |
|-------------|------|
| `settings/site-settings` | 地址、電話、社群連結、黑貓資料、Email 設定、favicon URL、OG Image URL |
| `settings/home-page` | 首頁標語、Hero 影片、精選商品清單 |
| `settings/shop-page` | 商店頁標題、說明、Hero 圖片、信任標章 |
| `settings/about-page` | 品牌故事文字（三段）、故事圖片、Hero 影片 |
| `settings/feature-flags` | 全站功能開關（`maintenanceMode` 等） |

### LocalizedString 格式

多語言字串一律以物件格式存入 Firestore：

```json
{
  "zh-TW": "日式刨冰",
  "en": "Japanese Shaved Ice",
  "ja": "かき氷"
}
```

讀取時透過 `localized(val, locale)` helper 函式解析（定義於 `src/lib/firestore/admin.ts`）。

### 資料庫連接相關檔案

| 檔案 | 用途 |
|-----|------|
| `src/lib/firebase/admin.ts` | 伺服器端 Firebase Admin SDK 初始化；匯出 `adminAuth`、`adminDb`、`adminStorage` |
| `src/lib/firebase/client.ts` | 客戶端 Firebase SDK 初始化（僅用於 Auth 操作）；匯出 `auth`、`db`、`storage` |
| `src/lib/firebase/auth-helpers.ts` | 輔助函式：`verifyAdminSession()`，優先讀 Firestore `users/{uid}.role`，fallback JWT claims |
| `src/lib/firestore/admin.ts` | 所有 Firestore **讀取**邏輯（伺服器端）：`getProducts`, `getNewsItems`, `getFaqs`, `getSiteSettings`, `getHomePage`, `getMenuItems` 等 |
| `src/lib/firestore/types.ts` | TypeScript 型別定義：`Product`, `Order`, `NewsItem`, `FaqItem`, `SiteSettings`, `HomePage` 等 |
| `src/app/api/admin/*/route.ts` | 所有 Firestore **寫入**邏輯（API Routes）：各 collection 的 GET/POST/PATCH/DELETE |

---

## 三、環境變數與依賴配置

### 必要環境變數（請至 Zeabur 後台設定，勿寫入程式碼）

```bash
# ── 公開網址 ──────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://www.asahihuuhu.com

# ── Firebase Admin SDK（伺服器端，保密）──────────────
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_CLIENT_EMAIL=YOUR_SERVICE_ACCOUNT_EMAIL
FIREBASE_PRIVATE_KEY=YOUR_PRIVATE_KEY_WITH_NEWLINES

# ── Firebase Client SDK（前端，可公開）──────────────
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

# ── ECPay 綠界金流（保密，勿存入 Firestore）──────────
ECPAY_IS_TEST=false
ECPAY_MERCHANT_ID=YOUR_MERCHANT_ID
ECPAY_HASH_KEY=YOUR_HASH_KEY
ECPAY_HASH_IV=YOUR_HASH_IV

# ── Email / SMTP（Lark Suite）────────────────────────
SMTP_HOST=smtp.larksuite.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=YOUR_LARK_EMAIL
SMTP_PASS=YOUR_LARK_SMTP_PASSWORD
SMTP_FROM=YOUR_LARK_EMAIL
SMTP_FROM_NAME=朝日夫婦
ADMIN_NOTIFY_EMAIL=YOUR_NOTIFY_EMAIL
```

> **注意：** `.env.example` 中仍有 `POSTGRES_URI` 和 `PAYLOAD_SECRET`，這是早期架構的遺留，**目前完全不使用 PostgreSQL 或 Payload CMS**，可忽略。

### 核心依賴套件

| 套件 | 版本 | 用途 |
|-----|------|------|
| `next` | ^15.4 | 框架（App Router） |
| `react` | ^19.0 | UI 框架 |
| `firebase` | ^12.13 | 前端 Firebase SDK |
| `firebase-admin` | ^13.10 | 伺服器端 Firebase Admin SDK |
| `next-intl` | ^3.26 | 多語言路由與訊息 |
| `zustand` | ^5.0 | 購物車全域狀態 |
| `tailwindcss` | ^3.4 | CSS 框架 |
| `lucide-react` | ^0.468 | 圖示庫 |
| `@radix-ui/*` | 各版本 | UI 元件基礎（Dialog, Tabs, Select 等） |
| `nodemailer` | ^8.0 | 訂單確認 Email |
| `sonner` | ^2.0 | Toast 通知 |
| `sharp` | ^0.34 | Next.js 圖片優化 |

### ⚠️ 廢棄但尚未移除的套件（技術債）

以下套件**實際上未被使用**，早期架構遺留，可安全移除：

- `payload` ^3.84
- `@payloadcms/db-mongodb`
- `@payloadcms/db-postgres`
- `@payloadcms/db-sqlite`
- `@payloadcms/email-nodemailer`
- `@payloadcms/next`
- `@payloadcms/richtext-lexical`
- `drizzle-kit`
- `pg`
- `graphql`

---

## 四、未完工任務清單（Todo List）

以下為原本計劃繼續開發的項目，依優先級排列：

### 高優先級

1. **修正既有商品的 `category` 欄位**
   - 問題：舊版 ProductForm 儲存的是 Firestore doc ID，新版改存 slug
   - 做法：至 Firestore Console → `products` collection，將各文件的 `category` 欄位從 doc ID 改為對應的 slug（如 `goods`、`seasonal`）；或重開後台商品編輯頁並重新儲存一次

2. **優惠券功能端對端驗證**
   - API 路由（`/api/admin/coupons`）和後台頁面已初步建立
   - 需驗證前台結帳時的折扣計算流程、使用次數限制（`usageCount++`）是否正確

3. **Email 訂單確認信測試**
   - SMTP 環境變數設定好後，需用真實訂單測試 ECPay callback 觸發後的 Email 送出

### 中優先級

4. **顧客管理頁重構**
   - `src/app/(payload)/admin/(protected)/collections/customers/` 目前引用舊 Payload 格式
   - 需重寫為讀取 Firebase Auth 用戶清單 + Firestore `users` collection 的格式

5. **商品頁面（前台）**
   - `/shop/[slug]` 單一商品詳細頁已存在但需確認 UI 完整性：圖片輪播、描述 Rich Text 渲染

6. **關於頁面圖片補充**
   - `storyImage1`、`storyImage2`、`storyImage3` 目前 fallback 到 `/public/asahi/img-about-*.png`
   - 需確認這些靜態檔案是否存在，或透過後台上傳補充

### 低優先級

7. **內用點餐 / 廚房管理**（完全未實作）
   - 目錄 `src/app/(payload)/admin/(protected)/dine-in/` 和 `kitchen/` 均為空殼
   - 需從頭設計並實作

8. **點數系統**（完全未實作）
   - `point-transactions` 相關路由為 stub
   - 需設計積點規則後從頭實作

9. **移除廢棄的 Payload CMS 套件**
   - `package.json` 中仍有大量 `@payloadcms/*` 依賴，可一次性清除以加速 build

---

## 五、潛在 Bug 與技術債

### 🔴 高風險（接手時需立即注意）

**1. 商品分類 ID vs Slug 不一致（已修正 Form，但舊資料未更新）**

- `src/app/(payload)/admin/(protected)/collections/products/ProductForm.tsx` 已改為儲存 slug
- 但 Firestore 中既有商品若是以舊版儲存的（存 doc ID），前台 `shop/page.tsx` 的 filter 仍會失效
- 症狀：Shop 頁面顯示「商品即將上架」
- 修復：需手動更新既有商品的 `category` 欄位

**2. `verifyAdminSession()` 的角色讀取有時序問題**

- 定義於 `src/lib/firebase/auth-helpers.ts`
- 流程：先讀 Firestore `users/{uid}.role`，若 Firestore doc 不存在則 fallback JWT custom claims
- 潛在問題：如果用戶在 Firebase Auth 創建後、Firestore `users/{uid}` 寫入前有任何 API 呼叫，會以 JWT claims 的 role 為準（可能為空）
- 建議：確保「建立用戶」的 API 是原子操作（Auth + Firestore 一起寫）

### 🟡 中風險

**3. ECPay Callback 沒有冪等保護**

- `src/app/api/ecpay/callback/route.ts`：收到 callback 後直接更新訂單狀態 + 扣減庫存
- 如果 ECPay 重複送 callback（網路重試），庫存可能重複扣減
- 建議：在更新前先檢查訂單是否已是 `paid` 狀態，若已付款則跳過

**4. `src/lib/firestore/types.ts` 的 `Product.category` 型別說明錯誤**

- 型別檔案第 16 行的 comment：`// product-categories doc id`
- 實際上現在存的是 slug 字串，comment 與現實不符，會誤導接手者
- 修復：更新 comment 為 `// product-category slug 字串（如 'goods', 'seasonal'）`

**5. `generateMetadata()` 每次 request 都查詢 Firestore**

- `src/app/layout.tsx` 的 `generateMetadata()` 每次都呼叫 `getSiteSettings('zh-TW')`
- 無任何快取機制，高流量下會造成不必要的 Firestore 讀取
- 建議：加入 Next.js `unstable_cache()` 包裹，設定 revalidate 時間（如 3600 秒）

### 🟢 低風險（技術債，不影響功能）

**6. `@payloadcms/*` 套件殘留**

- `package.json` 中有 10+ 個 Payload CMS 相關套件從未被 import
- 會拖慢 `npm install` 和 build 時間
- 修復：`npm uninstall payload @payloadcms/db-mongodb @payloadcms/db-postgres @payloadcms/db-sqlite @payloadcms/email-nodemailer @payloadcms/next @payloadcms/richtext-lexical drizzle-kit pg graphql`

**7. `package.json` 中的 `start:migrate` 和 `payload:migrate` scripts**

- 這些 scripts 呼叫 `payload migrate`，但 Payload CMS 已不使用
- 執行會報錯，建議移除或修改

**8. 後台管理員路由保護方式不統一**

- 大部分頁面用 `src/lib/firebase/auth-helpers.ts` 的 `verifyAdminSession()`
- 少數頁面直接在 page.tsx 內手動驗證 session cookie
- 建議長期統一為 `verifyAdminSession()` 模式

**9. 菜單品項的圖片欄位為選填**

- `menu-items` 的 `image` 欄位若為空，前台 MenuSection 沒有 placeholder 處理
- 建議加入 fallback 圖片邏輯

---

## 附錄：重要檔案路徑速查

```
src/
├── app/
│   ├── (frontend)/[locale]/          # 前台頁面（Next.js App Router）
│   │   ├── page.tsx                  # 首頁
│   │   ├── about/page.tsx            # 品牌故事
│   │   ├── shop/page.tsx             # 商店
│   │   ├── shop/[slug]/page.tsx      # 單一商品
│   │   ├── line-up/page.tsx          # 菜單
│   │   ├── checkout/page.tsx         # 結帳
│   │   └── news/                     # 最新消息
│   ├── (payload)/admin/(protected)/  # 後台管理頁面
│   │   ├── dashboard/                # 儀表板
│   │   ├── profile/                  # 個人資料
│   │   ├── collections/
│   │   │   ├── products/             # 商品管理
│   │   │   ├── orders/               # 訂單管理
│   │   │   ├── news/                 # 最新消息
│   │   │   ├── faqs/                 # 常見問答
│   │   │   ├── users/                # 用戶管理
│   │   │   ├── menu-items/           # 菜單品項管理
│   │   │   ├── coupons/              # 優惠券（部分完成）
│   │   │   └── media/                # 媒體庫
│   │   └── globals/
│   │       ├── home-page/            # 首頁設定
│   │       ├── about-page/           # 關於頁面設定
│   │       ├── shop-page/            # 商店頁設定
│   │       ├── site-settings/        # 網站設定（含 favicon、ECPay 說明）
│   │       └── feature-flags/        # 功能開關
│   ├── api/admin/                    # 後台 API Routes（Firestore 寫入）
│   │   ├── products/route.ts
│   │   ├── orders/route.ts
│   │   ├── menu-items/route.ts
│   │   └── ...（各 collection 均有對應路由）
│   └── api/ecpay/                    # ECPay 金流
│       ├── checkout/route.ts         # 建立訂單並送出 ECPay Form
│       └── callback/route.ts         # ECPay 付款回調（更新訂單狀態）
├── components/
│   ├── admin-shell/                  # 後台 UI（Sidebar, Topbar, Layout）
│   └── MenuSection.tsx               # 菜單展示組件（支援 CMS 字串與翻譯 key）
├── lib/
│   ├── firebase/
│   │   ├── admin.ts                  # Admin SDK 初始化
│   │   ├── client.ts                 # Client SDK 初始化
│   │   └── auth-helpers.ts           # verifyAdminSession()
│   ├── firestore/
│   │   ├── admin.ts                  # 所有 Firestore 讀取函式
│   │   └── types.ts                  # TypeScript 型別定義
│   └── cms.ts                        # CMS 讀取入口（包裝 firestore/admin.ts）
└── messages/                         # 多語言訊息檔
    ├── zh-TW.json
    ├── en.json
    └── ja.json
```
