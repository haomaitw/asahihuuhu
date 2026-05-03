import type { CollectionConfig } from 'payload';

export const Staff: CollectionConfig = {
  slug: 'staff',
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'order'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'position',
      type: 'text',
      localized: true,
      admin: { description: '職稱，如 創辦人、攝影師、助理' },
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      admin: { description: '簡短自我介紹' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: '個人照片' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { description: '排列順序（數字越小越前）' },
    },
  ],
};
