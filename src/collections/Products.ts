import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'stock', 'category', 'isAvailable'],
    group: '商品管理',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
      label: '商品名稱',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug（網址用）',
      admin: { position: 'sidebar' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: '售價（NT$）',
      admin: { position: 'sidebar' },
    },
    {
      name: 'comparePrice',
      type: 'number',
      label: '原價（劃線用，NT$）',
      admin: {
        position: 'sidebar',
        description: '設定後前台會顯示原價與折扣',
      },
    },
    // ── Inventory ─────────────────────────────────────────────────
    {
      name: 'trackStock',
      type: 'checkbox',
      defaultValue: true,
      label: '追蹤庫存',
      admin: { position: 'sidebar' },
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      label: '庫存數量',
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.trackStock !== false,
      },
    },
    {
      name: 'lowStockThreshold',
      type: 'number',
      defaultValue: 3,
      label: '低庫存警示（低於此值顯示警示）',
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.trackStock !== false,
      },
    },
    // ── Category ──────────────────────────────────────────────────
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      label: '商品分類',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isAvailable',
      type: 'checkbox',
      defaultValue: true,
      label: '上架販售',
      admin: { position: 'sidebar' },
    },
    // ── Media ─────────────────────────────────────────────────────
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: '商品圖片',
    },
    // ── Content ───────────────────────────────────────────────────
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      label: '簡短描述',
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: '詳細描述',
    },
    // ── SEO ───────────────────────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', localized: true, label: 'SEO 標題' },
        { name: 'description', type: 'textarea', localized: true, label: 'SEO 描述' },
      ],
    },
  ],
}
