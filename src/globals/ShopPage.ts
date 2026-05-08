import type { GlobalConfig } from 'payload';

export const ShopPage: GlobalConfig = {
  slug: 'shop-page',
  access: { read: () => true },
  admin: {
    description: '商店頁面設定：英雄區圖片、信任標誌文案等',
  },
  fields: [
    // ── 英雄區 ────────────────────────────────────────────────────
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '商店頁面英雄區圖片（建議比例 16:9 或更寬，留空則使用預設圖）',
      },
    },
    // ── 信任標誌 ──────────────────────────────────────────────────
    {
      name: 'trustItems',
      type: 'array',
      maxRows: 3,
      label: '信任標誌',
      admin: {
        description: '頁面下方信任標誌，最多 3 項（如：冷凍配送、固定運費、精心包裝）',
      },
      defaultValue: [
        { icon: '❄️', title: '冷凍配送',        description: '黑貓宅急便冷凍宅配，確保品質' },
        { icon: '🚚', title: '固定運費 NT$120', description: '全台宅配，1–3 個工作天送達' },
        { icon: '🎁', title: '精心包裝',        description: '職人用心包裝，完整呈現每份美味' },
      ],
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: '圖示（Emoji）',
          admin: { description: '如 ❄️、🚚、🎁' },
        },
        {
          name: 'title',
          type: 'text',
          label: '標題',
          localized: true,
          admin: { description: '如：冷凍配送' },
        },
        {
          name: 'description',
          type: 'text',
          label: '說明',
          localized: true,
          admin: { description: '如：黑貓宅急便冷凍宅配，確保品質' },
        },
      ],
    },
  ],
};
