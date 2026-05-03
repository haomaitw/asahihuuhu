import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'totalAmount', 'customerName', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { name: 'orderNumber', type: 'text', unique: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'productId', type: 'text' },
        { name: 'productName', type: 'text' },
        { name: 'quantity', type: 'number' },
        { name: 'unitPrice', type: 'number' },
      ],
    },
    { name: 'totalAmount', type: 'number' },
    { name: 'ecpayTradeNo', type: 'text' },
    { name: 'customerName', type: 'text' },
    { name: 'customerEmail', type: 'email' },
    { name: 'customerPhone', type: 'text' },
    { name: 'note', type: 'textarea' },
  ],
}
