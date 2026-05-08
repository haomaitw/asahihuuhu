import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'fulfillmentStatus', 'totalAmount', 'customerName', 'createdAt'],
    group: '訂單管理',
  },
  access: {
    create: () => true,
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      if (req.user?.collection === 'customers') return { customer: { equals: req.user.id } }
      return false
    },
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    // ── Core ──────────────────────────────────────────────────────
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      required: true,
      label: '訂單編號',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending_payment',
      label: '付款狀態',
      options: [
        { label: '待付款', value: 'pending_payment' },
        { label: '已付款', value: 'paid' },
        { label: '付款失敗', value: 'failed' },
        { label: '已退款', value: 'refunded' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'fulfillmentStatus',
      type: 'select',
      defaultValue: 'unfulfilled',
      label: '出貨狀態',
      options: [
        { label: '未出貨', value: 'unfulfilled' },
        { label: '備貨中', value: 'processing' },
        { label: '已出貨', value: 'shipped' },
        { label: '已送達', value: 'delivered' },
        { label: '已取消', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    // ── Customer ──────────────────────────────────────────────────
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      label: '會員帳號',
      admin: { position: 'sidebar', description: '登入結帳時自動關聯' },
    },
    { name: 'customerName', type: 'text', required: true, label: '收件人姓名' },
    { name: 'customerEmail', type: 'email', required: true, label: '電子郵件' },
    { name: 'customerPhone', type: 'text', required: true, label: '聯絡電話' },
    // ── Shipping ──────────────────────────────────────────────────
    {
      name: 'shippingAddress',
      type: 'group',
      label: '收件地址',
      fields: [
        { name: 'zip', type: 'text', label: '郵遞區號', admin: { width: '30%' } },
        { name: 'city', type: 'text', label: '縣市', admin: { width: '35%' } },
        { name: 'district', type: 'text', label: '鄉鎮市區', admin: { width: '35%' } },
        { name: 'address', type: 'text', label: '詳細地址' },
      ],
    },
    {
      name: 'shippingCarrier',
      type: 'select',
      label: '物流商',
      options: [
        { label: '黑貓宅急便', value: 'tcat' },
        { label: '7-11 超商取貨', value: '711' },
        { label: '全家超商取貨', value: 'family' },
        { label: '郵局', value: 'post' },
      ],
    },
    { name: 'trackingNumber', type: 'text', label: '物流追蹤號碼' },
    { name: 'shippedAt', type: 'date', label: '出貨時間' },
    // ── Items ─────────────────────────────────────────────────────
    {
      name: 'items',
      type: 'array',
      label: '商品明細',
      fields: [
        { name: 'productId', type: 'text', label: '商品 ID' },
        { name: 'productName', type: 'text', label: '商品名稱' },
        { name: 'quantity', type: 'number', label: '數量' },
        { name: 'unitPrice', type: 'number', label: '單價（NT$）' },
      ],
    },
    // ── Pricing ───────────────────────────────────────────────────
    { name: 'subtotal', type: 'number', label: '小計（NT$）' },
    { name: 'shippingFee', type: 'number', defaultValue: 0, label: '運費（NT$）' },
    { name: 'couponCode', type: 'text', label: '使用折扣碼' },
    { name: 'couponDiscount', type: 'number', defaultValue: 0, label: '折扣金額（NT$）' },
    {
      name: 'pointsRedeemed',
      type: 'number',
      defaultValue: 0,
      label: '兌換點數',
      admin: { description: '1 點 = NT$1 折抵' },
    },
    { name: 'totalAmount', type: 'number', required: true, label: '實付金額（NT$）' },
    {
      name: 'pointsEarned',
      type: 'number',
      defaultValue: 0,
      label: '獲得點數',
      admin: { readOnly: true, description: '付款後自動計算（每 NT$10 = 1 點）' },
    },
    // ── Payment ───────────────────────────────────────────────────
    { name: 'ecpayTradeNo', type: 'text', label: '綠界交易編號', admin: { readOnly: true } },
    { name: 'paidAt', type: 'date', label: '付款時間', admin: { readOnly: true } },
    { name: 'tcatOrderNo', type: 'text', label: '黑貓訂單編號', admin: { readOnly: true } },
    // ── Notes ─────────────────────────────────────────────────────
    { name: 'note', type: 'textarea', label: '顧客備註' },
    { name: 'adminNote', type: 'textarea', label: '內部備註（僅後台可見）' },
  ],
}
