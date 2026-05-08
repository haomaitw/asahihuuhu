import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },

  // Role-based access:
  // super-admin (代管商) → full CRUD on all users + system settings
  // admin       (客戶)   → can only read & update their own account (no create/delete)
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
        { label: '代管商（異想天開影像）', value: 'super-admin' },
        { label: '客戶（朝日夫婦）',       value: 'admin' },
      ],
      admin: {
        description: '代管商：可管理系統設定、帳號管理；客戶：可管理商品、訂單、內容等日常業務',
      },
      // Only super-admin can change the role field
      access: {
        update: ({ req }) => req.user?.role === 'super-admin',
      },
    },
  ],
};
