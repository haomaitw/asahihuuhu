import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: {
    staticDir: '../public/uploads',
    imageSizes: [
      { name: 'card', width: 600, height: 600, position: 'centre' },
      { name: 'og',   width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'card',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
    },
  ],
};
