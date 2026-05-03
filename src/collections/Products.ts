import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'price', 'category', 'isAvailable'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      admin: { position: 'sidebar' },
      options: [
        { label: 'Goods', value: 'goods' },
        { label: 'Seasonal', value: 'seasonal' },
      ],
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'isAvailable',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
