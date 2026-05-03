import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const PATHS = ['', '/news', '/line-up', '/shop', '/about', '/faq'];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    PATHS.map((p) => ({
      url:
        locale === routing.defaultLocale
          ? `${base}${p || '/'}`
          : `${base}/${locale}${p}`,
      lastModified,
    })),
  );
}
