import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'currentUses', 'maxUses', 'validUntil', 'isActive'],
    group: '行銷工具',
  },
  access: {
    read: () => true, // needed for frontend validation
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      label: '折扣碼',
      admin: { description: '建議使用大寫英數，例如：SUMMER20' },
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === 'string' ? value.toUpperCase().trim() : value),
        ],
      },
    },
    {
      name: 'description',
      type: 'text',
      label: '折扣描述',
      localized: true,
      admin: { description: '顯示給顧客的說明，例如：夏日優惠 8 折' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: '折扣類型',
      options: [
        { label: '百分比折扣（%）', value: 'percentage' },
        { label: '固定金額折扣（NT$）', value: 'fixed_amount' },
        { label: '免運費', value: 'free_shipping' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      label: '折扣值',
      admin: {
        description: '百分比請輸入 1–100；固定金額請輸入 NT$ 數字；免運費不需填寫',
        condition: (_, siblingData) => siblingData?.type !== 'free_shipping',
      },
    },
    {
      name: 'minOrderAmount',
      type: 'number',
      label: '最低訂單金額（NT$）',
      admin: { description: '未達此金額不可使用，留空表示無限制' },
    },
    {
      name: 'maxDiscountAmount',
      type: 'number',
      label: '最高折扣上限（NT$）',
      admin: {
        description: '百分比折扣時，折扣最高不超過此金額，留空表示無上限',
        condition: (_, siblingData) => siblingData?.type === 'percentage',
      },
    },
    {
      name: 'maxUses',
      type: 'number',
      label: '最大使用次數',
      admin: { description: '留空表示無限次數' },
    },
    {
      name: 'maxUsesPerCustomer',
      type: 'number',
      defaultValue: 1,
      label: '每位會員限用次數',
    },
    {
      name: 'currentUses',
      type: 'number',
      defaultValue: 0,
      label: '已使用次數',
      admin: { readOnly: true },
    },
    {
      name: 'validFrom',
      type: 'date',
      label: '有效開始日期',
    },
    {
      name: 'validUntil',
      type: 'date',
      label: '有效結束日期',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: '啟用',
      admin: { position: 'sidebar' },
    },
    {
      name: 'applicableProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: '指定商品（留空表示全館適用）',
    },
  ],
}
