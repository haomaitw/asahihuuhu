import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { SectionTitle } from '@/components/SectionTitle';
import { WaveDivider } from '@/components/WaveDivider';
import { ProductCarousel } from '@/components/ProductCarousel';
import { NewsItem } from '@/components/NewsItem';
import { Link } from '@/i18n/routing';
import {
  placeholderProducts,
  placeholderSeasonal,
  placeholderNews,
} from '@/lib/placeholder-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return {
    title: t('hero.tagline1'),
    description: t('hero.tagline2'),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations();

  const products = placeholderProducts.map((p) => ({
    ...p,
    name: t(p.name),
  }));
  const seasonal = placeholderSeasonal.map((p) => ({
    ...p,
    name: t(p.name),
  }));
  const news = placeholderNews.map((n) => ({
    ...n,
    title: t(n.title),
  }));

  return (
    <>
      <Hero />

      <WaveDivider fill="#FBF8F3" />

      <section className="bg-paper-50 py-24">
        <div className="container-content flex flex-col items-center gap-12">
          <SectionTitle
            eyebrow={t('home.products.eyebrow')}
            title={t('home.products.title')}
          />
          <ProductCarousel products={products} />
          <Link href="/line-up" className="pill-button">
            {t('common.seeMore')}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <WaveDivider fill="#E4F0F6" />

      <section className="bg-sea-100 py-24">
        <div className="container-content flex flex-col items-center gap-12">
          <SectionTitle
            eyebrow={t('home.limited.eyebrow')}
            title={t('home.limited.title')}
          />
          <ProductCarousel products={seasonal} />
        </div>
      </section>

      <WaveDivider fill="#FBF8F3" />

      <section className="bg-paper-50 py-24">
        <div className="container-content flex flex-col items-center gap-10">
          <SectionTitle
            eyebrow={t('home.news.eyebrow')}
            title={t('home.news.title')}
          />
          <div className="w-full max-w-2xl">
            {news.map((entry) => (
              <NewsItem key={entry.slug} entry={entry} />
            ))}
          </div>
          <Link href="/news" className="pill-button">
            {t('common.seeMore')}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
