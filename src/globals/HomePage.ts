import type { GlobalConfig } from 'payload';

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: { read: () => true },
  fields: [
    {
      name: 'tagline1',
      type: 'text',
      localized: true,
    },
    {
      name: 'tagline2',
      type: 'text',
      localized: true,
    },
    {
      name: 'heroLede',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'heroVideo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '首頁英雄區影片（MP4），留空則使用預設靜態影片',
      },
    },
    {
      name: 'heroPoster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '首頁英雄區影片封面圖（影片載入前顯示）',
      },
    },
    {
      name: 'featuredProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        description: '首頁精選商品（最多 6 件）',
      },
    },
    {
      name: 'seasonalVideo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '季節限定區背景影片（MP4）',
      },
    },
    {
      name: 'seasonalImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '季節限定區背景圖片（影片載入前或無影片時顯示）',
      },
    },
    {
      name: 'seasonalTitle',
      type: 'text',
      localized: true,
      admin: { description: '季節限定區標題' },
    },
    {
      name: 'seasonalDesc',
      type: 'textarea',
      localized: true,
      admin: { description: '季節限定區說明文字' },
    },
  ],
};
