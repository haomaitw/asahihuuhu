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
  ],
};
