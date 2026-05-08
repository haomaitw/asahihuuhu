import type { CollectionConfig } from 'payload'

export const PointTransactions: CollectionConfig = {
  slug: 'point-transactions',
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['customer', 'type', 'points', 'balance', 'createdAt'],
    group: '會員管理',
  },
  access: {
    // Admins see all; customers see their own
    read: ({ req }) => {
      if (req.user?.collection === 'users') return true
      if (req.user?.collection === 'customers') return { customer: { equals: req.user.id } }
      return false
    },
    // Only created by system (API)
    create: ({ req }) => req.user?.collection === 'users',
    update: () => false,
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      label: '會員',
      index: true,
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      label: '關聯訂單',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: '交易類型',
      options: [
        { label: '消費累點', value: 'earn' },
        { label: '兌換折抵', value: 'redeem' },
        { label: '點數到期', value: 'expire' },
        { label: '人工調整', value: 'adjust' },
        { label: '註冊獎勵', value: 'registration_bonus' },
        { label: '生日禮', value: 'birthday_bonus' },
      ],
    },
    {
      name: 'points',
      type: 'number',
      required: true,
      label: '點數變動（正數=增加，負數=扣除）',
    },
    {
      name: 'balance',
      type: 'number',
      required: true,
      label: '交易後餘額',
      admin: { readOnly: true },
    },
    {
      name: 'description',
      type: 'text',
      label: '說明',
    },
  ],
}
