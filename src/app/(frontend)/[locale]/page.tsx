import type { Metadata } from 'next';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { SectionTitle } from '@/components/SectionTitle';
import { WaveDivider } from '@/components/WaveDivider';
import { ProductCarousel } from '@/components/ProductCarousel';
import { NewsItem } from '@/components/NewsItem';
import { AnimateIn } from '@/components/AnimateIn';
import { SeeMoreLink } from '@/components/SeeMoreLink';
import { Reveal } from '@/components/Reveal';
import { Link } from '@/i18n/routing';
import {
  placeholderProducts,
  placeholderSeasonal,
  placeholderNews,
} from '@/lib/placeholder-data';
import { menu } from '@/lib/menu-data';
import { getProducts } from '@/lib/cms-products';
import { getNewsItems, getHomePageGlobal } from '@/lib/cms';

export const dynamic = 'force-dynamic'

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
      <Reveal direction="up">
        <section className="bg-paper-50 py-20 md:py-28 overflow-x-hidden">
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
      </Reveal>

      <WaveDivider fill="#d5e9f7" />

      {/* ── Seasonal / Limited ───────────────────────────────────────── */}
      <Reveal direction="up" delay={80}>
        <section className="bg-sea-100 py-20 md:py-28 overflow-x-hidden">
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
      </Reveal>

      <WaveDivider fill="#faf8f4" />

      {/* ── News ─────────────────────────────────────────────────────── */}
      <Reveal direction="up" delay={80}>
        <section className="bg-paper-50 py-20 md:py-28">
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
      </Reveal>

      <WaveDivider fill="#d5e9f7" />

      {/* ── Menu Highlights ──────────────────────────────────────────── */}
      <Reveal direction="up" delay={80}>
        <section className="bg-sea-100 py-20 md:py-28">
          <div className="container-content flex flex-col items-center gap-14">
            <AnimateIn>
              <SectionTitle eyebrow="LINE UP" title={t('home.lineup.title')} align="center" />
            </AnimateIn>
            <AnimateIn delay={100} className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {menu.flatMap((cat) => cat.items.filter((i) => i.image)).slice(0, 4).map((item) => (
                <Link key={item.id} href="/line-up" className="group flex flex-col items-center gap-3">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-paper-100 shadow-sm">
                    <Image
                      src={item.image!}
                      alt={t(item.nameKey as any)}
                      fill
                      sizes="(max-width:768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.badge && (
                      <span className="absolute top-2 left-2 rounded-full bg-sea-400 px-2.5 py-0.5 text-[10px] font-sans font-medium tracking-wider text-white uppercase">
                        {item.badge === 'new' ? 'NEW' : t('badge.seasonal')}
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs tracking-[0.12em] text-ink/70 text-center leading-snug">
                    {t(item.nameKey as any)}
                  </p>
                </Link>
              ))}
            </AnimateIn>
            <AnimateIn delay={250}>
              <SeeMoreLink href="/line-up" label={t('common.seeMore')} />
            </AnimateIn>
          </div>
        </section>
      </Reveal>

      {/* ── Brand Story Teaser ───────────────────────────────────────── */}
      <WaveDivider fill="#2c1a08" />

      <Reveal direction="up" delay={60}>
        <section className="py-20 md:py-28" style={{ background: '#2c1a08' }}>
          <div className="container-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

              {/* ── Text column ─────────────────────────────────────── */}
              <AnimateIn className="flex flex-col gap-7">
                <p className="font-sans font-light text-xs tracking-[0.3em] uppercase text-sea-400">
                  {t('about.story.eyebrow')}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl tracking-wide text-white leading-snug">
                  {t('about.story.title')}
                </h2>
                <p className="font-sans font-light text-sm leading-relaxed text-white/55 max-w-sm">
                  {t('home.about.lede')}
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-4 self-start rounded-pill border border-white/20 bg-white/10 px-2 py-2 pr-2 font-sans font-light text-sm tracking-[0.25em] text-white/70 transition-all duration-500 hover:bg-white/20 hover:text-white group"
                >
                  <span className="pl-4 pr-2">{t('common.seeMore')}</span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sea-400 text-white text-base group-hover:bg-white group-hover:text-sea-400 transition-all duration-500">→</span>
                </Link>
              </AnimateIn>

              {/* ── Images column ───────────────────────────────────── */}
              <AnimateIn delay={150} className="relative">
                {/* Main image */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/asahi/67d79a864bfa605e29f4a621_img-top-about1.png"
                    alt="朝日夫婦的故事"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                {/* Accent image */}
                <div
                  className="absolute -bottom-6 -left-6 w-[48%] aspect-square rounded-2xl overflow-hidden shadow-xl border-4"
                  style={{ borderColor: '#2c1a08' }}
                >
                  <Image
                    src="/asahi/67d79a869b7cba72b493e155_img-top-about2.png"
                    alt="朝日夫婦手工刨冰"
                    fill
                    sizes="30vw"
                    className="object-cover"
                  />
                </div>
              </AnimateIn>

            </div>
          </div>
        </section>
      </Reveal>
    </>
  );
}
