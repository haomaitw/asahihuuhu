import { withPayload } from '@payloadcms/next/withPayload';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // These packages use native bindings or CJS — must NOT be bundled by webpack
  serverExternalPackages: [
    'pg',
    'pg-native',
    '@payloadcms/db-postgres',
    'drizzle-orm',
    'drizzle-kit',
    'sharp',
  ],

  // Force nft to include drizzle-kit's CJS api.js in standalone output.
  // Use explicit file + glob patterns — '**' alone misses root-level files in some nft versions.
  outputFileTracingIncludes: {
    '/api/gen-migration': [
      './node_modules/drizzle-kit/api.js',
      './node_modules/drizzle-kit/api.d.ts',
      './node_modules/drizzle-kit/**/*',
    ],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  devIndicators: false,
};

export default withNextIntl(withPayload(nextConfig));
