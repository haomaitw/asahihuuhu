import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },

  // Role-based access:
  // super-admin → full CRUD on all users
  // admin       → can only read & update their own account (no create/delete)
  access: {
    create: ({ req }) => req.user?.role === 'super-admin',
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'super-admin') return true
      // Regular admin can only read their own record
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'super-admin') return true
      // Regular admin can update their own record only
      return { id: { equals: req.user.id } }
    },
    delete: ({ req }) => req.user?.role === 'super-admin',
    // unlock applies to auth-related account locks
    unlock: ({ req }) => req.user?.role === 'super-admin',
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
      // Only super-admin can change the role field
      access: {
        update: ({ req }) => req.user?.role === 'super-admin',
      },
    },
  ],
};
