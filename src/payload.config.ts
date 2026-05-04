import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
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

const pgUri = process.env.POSTGRES_URI || process.env.DATABASE_URL || '';

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

  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

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

  db: pgUri
    ? postgresAdapter({
        pool: {
          connectionString: pgUri,
        },
      })
    : sqliteAdapter({
        // Use /tmp in Docker (always writable); fallback to local file in dev
        client: { url: process.env.NODE_ENV === 'production' ? 'file:/tmp/payload.db' : 'file:./payload-dev.db' },
      }),

  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-change-in-production',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  sharp,
});
