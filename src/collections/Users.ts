import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      required: true,
      options: [
        { label: '最高管理員（異想天開影像）', value: 'super-admin' },
        { label: '管理員（老闆）', value: 'admin' },
      ],
      admin: {
        description: '最高管理員可編輯系統設定與使用者；管理員可管理內容、商品、訂單',
      },
    },
  ],
};
