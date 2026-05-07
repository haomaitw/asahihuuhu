import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    verify: false,
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000, // 10 minutes
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'points', 'tier', 'totalSpent', 'createdAt'],
    group: '會員管理',
  },
  access: {
    // Admins (Users) can read all; customers can only read themselves
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      if (req.user?.collection === 'customers') return { id: { equals: req.user.id } }
      return false
    },
    // Allow public registration
    create: () => true,
    update: ({ req }) => {
      if (req.user?.collection === 'users') return true
      if (req.user?.collection === 'customers') return { id: { equals: req.user.id } }
      return false
    },
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: '姓名',
    },
    {
      name: 'phone',
      type: 'text',
      label: '手機號碼',
    },
    {
      name: 'birthday',
      type: 'date',
      label: '生日',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'gender',
      type: 'select',
      label: '性別',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '不透露', value: 'other' },
      ],
    },
    // Loyalty points (managed by system via PointTransactions)
    {
      name: 'points',
      type: 'number',
      defaultValue: 0,
      label: '可用點數',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: '由系統自動計算，請勿手動修改',
      },
    },
    {
      name: 'tier',
      type: 'select',
      defaultValue: 'regular',
      label: '會員等級',
      options: [
        { label: '一般會員', value: 'regular' },
        { label: '銀卡會員（累消 NT$3,000）', value: 'silver' },
        { label: '金卡會員（累消 NT$10,000）', value: 'gold' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'totalSpent',
      type: 'number',
      defaultValue: 0,
      label: '累計消費金額',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: '付款成功後自動累計',
      },
    },
    {
      name: 'marketingConsent',
      type: 'checkbox',
      defaultValue: false,
      label: '同意接收行銷通知',
    },
    // Shipping addresses (denormalized for simplicity)
    {
      name: 'defaultAddress',
      type: 'group',
      label: '預設收件地址',
      fields: [
        { name: 'recipient', type: 'text', label: '收件人' },
        { name: 'phone', type: 'text', label: '收件電話' },
        { name: 'zip', type: 'text', label: '郵遞區號', admin: { width: '30%' } },
        { name: 'city', type: 'text', label: '縣市', admin: { width: '35%' } },
        { name: 'district', type: 'text', label: '鄉鎮市區', admin: { width: '35%' } },
        { name: 'address', type: 'text', label: '詳細地址' },
      ],
    },
  ],
}
