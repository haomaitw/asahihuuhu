import { buildConfig } from 'payload';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

import { Users } from './collections/Users';
import { Customers } from './collections/Customers';
import { Media } from './collections/Media';
import { News } from './collections/News';
import { FAQs } from './collections/FAQs';
import { Products } from './collections/Products';
import { Orders } from './collections/Orders';
import { ProductCategories } from './collections/ProductCategories';
import { NewsCategories } from './collections/NewsCategories';
import { Staff } from './collections/Staff';
import { Coupons } from './collections/Coupons';
import { PointTransactions } from './collections/PointTransactions';
import { SiteSettings } from './globals/SiteSettings';
import { HomePage } from './globals/HomePage';
import { AboutPage } from './globals/AboutPage';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const pgUri = process.env.POSTGRES_URI || process.env.DATABASE_URL || '';

if (!pgUri && process.env.NODE_ENV === 'production') {
  throw new Error('POSTGRES_URI or DATABASE_URL must be set in production');
}

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

  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM ?? 'oa@extrastudio.tw',
    defaultFromName: process.env.SMTP_FROM_NAME ?? '朝日夫婦',
    transportOptions: {
      host: process.env.SMTP_HOST ?? 'smtp.larksuite.com',
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: process.env.SMTP_SECURE !== 'false', // true for port 465
      auth: {
        user: process.env.SMTP_USER ?? 'oa@extrastudio.tw',
        pass: process.env.SMTP_PASS ?? '',
      },
    },
  }),

  collections: [
    Users, Customers,
    Media,
    Products, ProductCategories,
    Orders, Coupons, PointTransactions,
    News, NewsCategories,
    FAQs, Staff,
  ],

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

  db: postgresAdapter({
    pool: {
      connectionString: pgUri || 'postgresql://localhost/asahi_dev',
    },
    // Migration files live in src/migrations/.
    // Generate: pnpm payload:migrate:create --name=<label>
    // Apply:    pnpm payload:migrate  (or use start:migrate in production)
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-change-in-production',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  sharp,
});
