import type { Metadata } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { SectionTitle } from '@/components/SectionTitle';
import { WaveDivider } from '@/components/WaveDivider';
import { ProductCarousel } from '@/components/ProductCarousel';
import { NewsItem } from '@/components/NewsItem';
import { AnimateIn } from '@/components/AnimateIn';
import { SeeMoreLink } from '@/components/SeeMoreLink';
import {
  placeholderProducts,
  placeholderSeasonal,
  placeholderNews,
} from '@/lib/placeholder-data';
import { getProducts } from '@/lib/cms-products';
import { getNewsItems, getHomePageGlobal } from '@/lib/cms';

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

  const [cmsProducts, cmsNews, homePage] = await Promise.all([
    getProducts(locale).catch(() => null),
    getNewsItems(locale, 3).catch(() => null),
    getHomePageGlobal(locale).catch(() => null),
  ]);

  const heroVideo  = (homePage as any)?.heroVideo?.url  ?? null;
  const heroPoster = (homePage as any)?.heroPoster?.url ?? null;
  const tagline1   = (homePage as any)?.tagline1  || null;
  const tagline2   = (homePage as any)?.tagline2  || null;
  const heroLede   = (homePage as any)?.heroLede  || null;

  const goods    = cmsProducts?.filter((p) => p.category === 'goods')    ?? null;
  const seasonal = cmsProducts?.filter((p) => p.category === 'seasonal') ?? null;

  return (
    <HomeContent
      heroVideo={heroVideo}
      heroPoster={heroPoster}
      tagline1={tagline1}
      tagline2={tagline2}
      heroLede={heroLede}
      cmsGoods={goods}
      cmsSeasonal={seasonal}
      cmsNews={cmsNews}
    />
  );
}

type HomeContentProps = {
  heroVideo:  string | null
  heroPoster: string | null
  tagline1:   string | null
  tagline2:   string | null
  heroLede:   string | null
  cmsGoods: Array<{
    id: string; name: string; slug?: string; image: string; price: number;
    comparePrice?: number; shortDescription?: string; stock?: number; trackStock?: boolean
  }> | null
  cmsSeasonal: Array<{
    id: string; name: string; slug?: string; image: string; price: number;
    comparePrice?: number; shortDescription?: string; stock?: number; trackStock?: boolean
  }> | null
  cmsNews: Array<{ slug: string; date: string; title: string }> | null
}

function HomeContent({
  heroVideo, heroPoster, tagline1, tagline2, heroLede,
  cmsGoods, cmsSeasonal, cmsNews,
}: HomeContentProps) {
  const t      = useTranslations();
  const locale = useLocale();

  const products = cmsGoods?.length
    ? cmsGoods
    : placeholderProducts.map((p) => ({ ...p, name: t(p.name) }));

  const seasonalProducts = cmsSeasonal?.length
    ? cmsSeasonal
    : placeholderSeasonal.map((p) => ({ ...p, name: t(p.name) }));

  const news = cmsNews?.length
    ? cmsNews
    : placeholderNews.map((n) => ({ ...n, title: t(n.title) }));

  return (
    <>
      {/* ── Hero — full viewport ────────────────────────────────────── */}
      <Hero
        videoSrc={heroVideo ?? undefined}
        poster={heroPoster ?? undefined}
        tagline1={tagline1 ?? undefined}
        tagline2={tagline2 ?? undefined}
        lede={heroLede ?? undefined}
      />

      <WaveDivider fill="#faf8f4" />

      {/* ── Products ─────────────────────────────────────────────────── */}
      <section className="bg-paper-50 py-24 md:py-32">
        <div className="container-content flex flex-col items-center gap-14">
          <AnimateIn>
            <SectionTitle
              eyebrow={t('home.products.eyebrow')}
              title={t('home.products.title')}
            />
          </AnimateIn>
          <AnimateIn delay={100} className="w-full">
            <ProductCarousel products={products} locale={locale} />
          </AnimateIn>
          <AnimateIn delay={200}>
            <SeeMoreLink href="/shop" label={t('common.seeMore')} />
          </AnimateIn>
        </div>
      </section>

      <WaveDivider fill="#d5e9f7" />

      {/* ── Seasonal / Limited ───────────────────────────────────────── */}
      <section className="bg-sea-100 py-24 md:py-32">
        <div className="container-content flex flex-col items-center gap-14">
          <AnimateIn>
            <SectionTitle
              eyebrow={t('home.limited.eyebrow')}
              title={t('home.limited.title')}
            />
          </AnimateIn>
          <AnimateIn delay={100} className="w-full">
            <ProductCarousel products={seasonalProducts} locale={locale} />
          </AnimateIn>
          <AnimateIn delay={200}>
            <SeeMoreLink href="/shop" label={t('common.seeMore')} />
          </AnimateIn>
        </div>
      </section>

      <WaveDivider fill="#faf8f4" />

      {/* ── News ─────────────────────────────────────────────────────── */}
      <section className="bg-paper-50 py-24 md:py-32">
        <div className="container-content flex flex-col items-center gap-14">
          <AnimateIn>
            <SectionTitle
              eyebrow={t('home.news.eyebrow')}
              title={t('home.news.title')}
            />
          </AnimateIn>
          <div className="w-full max-w-2xl">
            {news.map((entry, i) => (
              <AnimateIn key={entry.slug} delay={i * 90}>
                <NewsItem entry={entry} />
              </AnimateIn>
            ))}
          </div>
          <AnimateIn delay={300}>
            <SeeMoreLink href="/news" label={t('common.seeMore')} />
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
