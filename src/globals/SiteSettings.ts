import type { GlobalConfig } from 'payload';

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: { read: () => true },
  fields: [
    {
      name: 'address',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'contact',
      type: 'text',
      localized: true,
    },
    {
      name: 'hoursWeekday',
      type: 'text',
      localized: true,
    },
    {
      name: 'hoursClosed',
      type: 'text',
      localized: true,
    },
    {
      name: 'facebookUrl',
      type: 'text',
    },
    {
      name: 'instagramUrl',
      type: 'text',
    },
  ],
};
