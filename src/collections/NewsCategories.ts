import type { CollectionConfig } from 'payload';

export const NewsCategories: CollectionConfig = {
  slug: 'news-categories',
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
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
      admin: { description: '英文識別碼，如 announcement / event / news' },
    },
  ],
};
