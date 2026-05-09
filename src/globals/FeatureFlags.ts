import type { GlobalConfig } from 'payload'

export const FeatureFlags: GlobalConfig = {
  slug: 'feature-flags',
  label: '功能開關',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'shopEnabled',
      type: 'checkbox',
      label: '商城（前台購物）',
      defaultValue: true,
      admin: { description: '關閉後前台商品頁、購物車、結帳功能全部停用' },
    },
    {
      name: 'guestCheckoutEnabled',
      type: 'checkbox',
      label: '訪客結帳',
      defaultValue: true,
      admin: { description: '允許未登入的訪客直接結帳，關閉後需先登入會員' },
    },
    {
      name: 'couponsEnabled',
      type: 'checkbox',
      label: '優惠券',
      defaultValue: true,
      admin: { description: '結帳頁顯示折扣碼輸入欄位' },
    },
    {
      name: 'pointsEnabled',
      type: 'checkbox',
      label: '會員點數',
      defaultValue: true,
      admin: { description: '啟用點數累積與折抵功能' },
    },
    {
      name: 'orderTrackingEnabled',
      type: 'checkbox',
      label: '訂單追蹤頁（/track）',
      defaultValue: true,
      admin: { description: '公開的訂單查詢頁，訪客可透過訂單編號 + Email 查詢出貨狀態' },
    },
    {
      name: 'dineInEnabled',
      type: 'checkbox',
      label: 'QR 碼點餐系統',
      defaultValue: false,
      admin: { description: '【開發中】掃碼點餐與廚房顯示系統' },
    },
    {
      name: 'customerServiceEnabled',
      type: 'checkbox',
      label: '線上客服',
      defaultValue: false,
      admin: { description: '【開發中】即時客服對話視窗' },
    },
    {
      name: 'reviewsEnabled',
      type: 'checkbox',
      label: '商品評價',
      defaultValue: false,
      admin: { description: '【開發中】顧客留下商品評分與評論' },
    },
  ],
}
