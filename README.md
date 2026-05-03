# ASAHI HUUHU 朝日夫婦

朝日夫婦官方網站（重建版）。

## 技術棧

- **前端**: Next.js 15 (App Router) + TypeScript
- **樣式**: Tailwind CSS
- **i18n**: next-intl（zh-TW 預設、en、ja）
- **後台 (Phase 2)**: Payload CMS 3
- **DB (Phase 2)**: PostgreSQL
- **金流 / 物流 / 發票 (Phase 4)**: ECPay 綠界
- **部署**: Zeabur（透過 GitHub）

## Phase 進度

- [x] **Phase 1** — 公開前台 scaffold
- [ ] **Phase 2** — Payload CMS 接入（內容、圖片、公告皆從後台編輯）
- [ ] **Phase 3** — 商品資料模型 + 購物車 + 結帳流程
- [ ] **Phase 4** — ECPay 串接（金流、超商取貨、電子發票）
- [ ] **Phase 5** — Instagram / Facebook 動態整合

## 本地啟動

```bash
npm install
cp .env.example .env
npm run dev
```

預設啟動於 [http://localhost:3000](http://localhost:3000)。

## 路由結構

```
/                  → zh-TW（預設語系，無前綴）
/en, /en/*         → 英文
/ja, /ja/*         → 日文

頁面：
  /                首頁
  /news            最新消息
  /news/[slug]     單篇公告
  /line-up         產品介紹
  /shop            周邊商品
  /about           關於朝日
  /faq             常見問題
```

## 目錄結構

```
src/
  app/
    (frontend)/
      [locale]/
        layout.tsx       公開前台版型（含 Header/Footer）
        page.tsx         首頁
        line-up/         產品介紹
        shop/            周邊商品
        about/           關於朝日
        faq/             常見問題
        news/            最新消息（列表 + 詳細）
    (payload)/           ← Phase 2 將在此加入後台
    layout.tsx           Root layout（字型、global CSS）
    globals.css
    robots.ts
    sitemap.ts
  components/            共用元件（Header / Footer / Hero / WaveDivider...）
  i18n/                  next-intl 設定
  lib/                   placeholder 資料（Phase 2 改由 CMS 提供）
  middleware.ts          locale 偵測 + 轉址
messages/
  zh-TW.json
  en.json
  ja.json
```

## 多語系編輯

Phase 1 的文案放在 `messages/{locale}.json`。Phase 2 接入 Payload 後，CMS 會接管所有可編輯文字（每欄位逐語系），messages JSON 僅保留 UI label（如 "See More"、"+ 加入購物車"）。

## 部署到 Zeabur

1. push 此 repo 到 GitHub
2. Zeabur 新增專案 → 從 GitHub 匯入
3. 設定環境變數（參考 `.env.example`）
4. Zeabur 會自動偵測 Next.js 並執行 `npm run build` + `npm run start`

## 注意事項

- 目前圖片皆為 placeholder（unsplash / picsum）— Phase 2 會改用 CMS 上傳的 Media。
- 所有文案皆為占位 — Phase 2 會由 Payload 後台覆寫。
- 社群連結（Facebook / Instagram）目前指向首頁 — 需替換為實際品牌帳號。
