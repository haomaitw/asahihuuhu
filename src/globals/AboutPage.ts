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
  ],
};
