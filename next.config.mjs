import { withPayload } from '@payloadcms/next/withPayload';
import createNextIntlPlugin from 'next-intl/plugin';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // These packages use native Node.js bindings or CJS — must NOT be bundled by webpack
  serverExternalPackages: [
    'pg',
    'pg-native',
    'pg-connection-string',
    'payload',
    '@payloadcms/db-postgres',
    '@payloadcms/drizzle',
    '@payloadcms/email-nodemailer',
    '@payloadcms/next',
    '@payloadcms/richtext-lexical',
    '@payloadcms/translations',
    '@payloadcms/ui',
    'drizzle-orm',
    'drizzle-kit',
    'sharp',
    'nodemailer',
    'busboy',
  ],

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
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '*.zeabur.app' },
      { protocol: 'https', hostname: 'asahihuuhu.howard.taipei' },
      { protocol: 'https', hostname: 'asahihuuhu.com' },
      { protocol: 'https', hostname: 'www.asahihuuhu.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  devIndicators: false,
};

const payloadConfig = withPayload(nextConfig);

// Stub @payload-config for Edge runtime webpack compilation only.
// instrumentation.ts is compiled for both Node.js AND Edge runtimes. Without this,
// webpack traces: @payload-config → payload.config.ts → pg → @next/env → crypto → BUILD ERROR.
// The stub returns an empty module; register() exits early in Edge runtime anyway.
// Node.js compilation resolves @payload-config to the real compiled file via the
// tsconfig path alias — no stub needed there.
const _payloadWebpack = payloadConfig.webpack
payloadConfig.webpack = (config, options) => {
  const result = typeof _payloadWebpack === 'function' ? _payloadWebpack(config, options) : config
  if (options.nextRuntime === 'edge') {
    result.resolve ??= {}
    result.resolve.alias = {
      ...result.resolve.alias,
      '@payload-config': resolve(__dirname, 'src/payload-config-stub.js'),
    }
  }
  return result
}

export default withNextIntl(payloadConfig);
