import { buildConfig } from 'payload';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { News } from './collections/News';
import { FAQs } from './collections/FAQs';
import { Products } from './collections/Products';
import { Orders } from './collections/Orders';
import { ProductCategories } from './collections/ProductCategories';
import { NewsCategories } from './collections/NewsCategories';
import { Staff } from './collections/Staff';
import { SiteSettings } from './globals/SiteSettings';
import { HomePage } from './globals/HomePage';
import { AboutPage } from './globals/AboutPage';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: 'light',
    meta: {
      titleSuffix: '— 異想天開影像 CMS',
    },
    components: {
      graphics: {
        Logo: { path: '@/components/admin/Logo', exportName: 'AdminLogo' },
        Icon: { path: '@/components/admin/Icon', exportName: 'AdminIcon' },
      },
    },
  },

  collections: [Users, Media, News, FAQs, Products, Orders, ProductCategories, NewsCategories, Staff],

  globals: [SiteSettings, HomePage, AboutPage],

  localization: {
    locales: [
      { label: '繁體中文', code: 'zh-TW' },
      { label: 'English', code: 'en' },
      { label: '日本語', code: 'ja' },
    ],
    defaultLocale: 'zh-TW',
    fallback: true,
  },

  editor: lexicalEditor(),

  // Production: set MONGODB_URI; local dev falls back to SQLite (no DB setup required)
  db: process.env.MONGODB_URI
    ? mongooseAdapter({ url: process.env.MONGODB_URI })
    : sqliteAdapter({ client: { url: 'file:./payload-dev.db' } }),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  sharp,
});
