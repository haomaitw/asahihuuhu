import type { GlobalConfig } from 'payload';

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  access: { read: () => true },
  fields: [
    {
      name: 'heroSubtitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'heroVideo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '關於我們英雄區影片（MP4），留空則使用預設靜態影片',
      },
    },
    {
      name: 'heroPoster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: '關於我們英雄區影片封面圖',
      },
    },
    {
      name: 'storyP1',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'storyP2',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'storyP3',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'storyImage1',
      type: 'upload',
      relationTo: 'media',
      admin: { description: '故事區第一張圖片' },
    },
    {
      name: 'storyImage2',
      type: 'upload',
      relationTo: 'media',
      admin: { description: '故事區第二張圖片' },
    },
    {
      name: 'storyImage3',
      type: 'upload',
      relationTo: 'media',
      admin: { description: '故事區第三張圖片' },
    },
  ],
};
