import { withPayload } from '@payloadcms/next/withPayload';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // These packages use native Node.js bindings or CJS — must NOT be bundled by webpack
  serverExternalPackages: [
    'pg',
    'pg-native',
    '@payloadcms/db-postgres',
    '@payloadcms/drizzle',
    '@payloadcms/email-nodemailer',
    'drizzle-orm',
    'drizzle-kit',
    'sharp',
    'nodemailer',
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent Node.js built-ins from breaking the browser bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        os: false,
        path: false,
        stream: false,
        net: false,
        tls: false,
      }
    }
    return config
  },

  // Force nft to include drizzle-kit's CJS api.js in standalone output.
  // '/**' ensures it's available for instrumentation.ts (no route) as well as
  // the /api/apply-db and /api/gen-migration routes that use it at runtime.
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/drizzle-kit/api.js',
      './node_modules/drizzle-kit/api.d.ts',
      './node_modules/drizzle-kit/**/*',
    ],
  },

  async headers() {
    return [
      {
        // All frontend pages — prevent CDN/proxy caching of CMS-driven HTML
        source: '/((?!_next|api|admin).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
    ]
  },

  images: {
    remotePatterns: [
      // Placeholder / stock images used during development
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'placehold.co' },
      // Payload-uploaded media: served from the same server, URL = NEXT_PUBLIC_SITE_URL/media/*
      // Zeabur staging subdomain
      { protocol: 'https', hostname: '*.zeabur.app' },
      // Production custom domain
      { protocol: 'https', hostname: 'asahihuuhu.com' },
      { protocol: 'https', hostname: 'www.asahihuuhu.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  devIndicators: false,
};

export default withNextIntl(withPayload(nextConfig));
