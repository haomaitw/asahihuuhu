import type { CollectionConfig } from 'payload';

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: '英文識別碼，如 goods / seasonal' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: '排列順序（數字越小越前）' },
    },
  ],
};
