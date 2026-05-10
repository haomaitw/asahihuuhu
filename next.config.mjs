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
    '@payloadcms/db-postgres',
    '@payloadcms/drizzle',
    '@payloadcms/email-nodemailer',
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

// Apply withPayload first, then patch webpack AFTER so our changes
// cannot be overridden by withPayload's own webpack logic.
const payloadConfig = withPayload(nextConfig);
const _payloadWebpack = payloadConfig.webpack;

payloadConfig.webpack = (config, options) => {
  // Run withPayload's webpack modifications first
  const result = typeof _payloadWebpack === 'function'
    ? _payloadWebpack(config, options)
    : config;

  if (!options.isServer) {
    result.resolve ??= {};

    // Redirect @payload-config to an empty stub on the client bundle.
    // withPayload should do this automatically, but it's not working in this
    // version combination — so we override it explicitly. This cuts the entire
    // pg → pg-connection-string → fs dependency chain from the browser bundle.
    result.resolve.alias = {
      ...result.resolve.alias,
      '@payload-config': resolve(__dirname, 'src/payload-config-stub.js'),
    };

    // Belt-and-suspenders: stub out Node.js built-ins so any other
    // server-only code that still slips through gets an empty module
    // instead of a build error.
    result.resolve.fallback = {
      ...result.resolve.fallback,
      stream: false,
      crypto: false,
      fs: false,
      os: false,
      path: false,
      net: false,
      tls: false,
      child_process: false,
    };
  }

  return result;
};

export default withNextIntl(payloadConfig);
