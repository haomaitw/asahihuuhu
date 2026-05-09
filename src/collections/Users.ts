import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },

  // Role-based access:
  // super-admin (代管商) → full CRUD on all users + system settings
  // admin       (客戶)   → can read/update own account + manage staff accounts
  // staff       (員工)   → can only read/update their own account
  access: {
    // Custom endpoint /api/admin/users handles creation with overrideAccess
    create: ({ req }) => ['super-admin', 'admin'].includes(req.user?.role ?? ''),
    read: ({ req }) => {
      if (!req.user) return false
      if (['super-admin', 'admin'].includes(req.user.role ?? '')) return true
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (['super-admin', 'admin'].includes(req.user.role ?? '')) return true
      return { id: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'super-admin') return true
      if (req.user.role === 'admin') return { role: { equals: 'staff' } }
      return false
    },
    unlock: ({ req }) => ['super-admin', 'admin'].includes(req.user?.role ?? ''),
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
        { label: '員工',                   value: 'staff' },
      ],
      admin: {
        description: '代管商：可管理系統設定、帳號管理；客戶：可管理商品、訂單、內容等日常業務；員工：由客戶分配權限的員工帳號',
      },
      // Only super-admin can assign super-admin or admin role; admin can assign staff
      access: {
        update: ({ req }) => req.user?.role === 'super-admin' || req.user?.role === 'admin',
      },
    },
  ],
};
