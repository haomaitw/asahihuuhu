import type { Metadata } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { SectionTitle } from '@/components/SectionTitle';
import { WaveDivider } from '@/components/WaveDivider';
import { ProductCard } from '@/components/ProductCard';
import { AnimateIn } from '@/components/AnimateIn';
import {
  placeholderProducts,
  placeholderSeasonal,
} from '@/lib/placeholder-data';
import { getProducts } from '@/lib/cms-products';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'shop' });
  return { title: t('title'), description: t('description') };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  let cmsProducts: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    cmsProducts = await getProducts(locale);
  } catch {
    // DB not ready — fall back to placeholders
  }

  const goods    = cmsProducts.filter((p) => p.category === 'goods');
  const seasonal = cmsProducts.filter((p) => p.category === 'seasonal');

  return (
    <ShopContent
      goods={goods.length ? goods : null}
      seasonal={seasonal.length ? seasonal : null}
    />
  );
}

type ShopProduct = {
  id: string; name: string; slug?: string; image: string;
  price?: number; comparePrice?: number; shortDescription?: string;
  stock?: number; trackStock?: boolean;
}

function ShopContent({
  goods,
  seasonal,
}: {
  goods: ShopProduct[] | null
  seasonal: ShopProduct[] | null
}) {
  const t      = useTranslations();
  const locale = useLocale();

  const goodsProducts: ShopProduct[] = goods ??
    placeholderProducts.map((p) => ({ ...p, name: t(p.name as any) }));

  const seasonalProducts: ShopProduct[] = seasonal ??
    placeholderSeasonal.map((p) => ({ ...p, name: t(p.name as any) }));

  const hasGoods    = !!goods?.length;
  const hasSeasonal = !!seasonal?.length;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <PageHero
        eyebrow="SHOP"
        title={t('shop.title')}
        description={t('shop.description')}
        media={{ kind: 'image', src: '/asahi/hero-shop.png' }}
      />

      <WaveDivider fill="#faf8f4" />

      {/* ── Goods ────────────────────────────────────────────────────── */}
      <section className="bg-paper-50 py-20 md:py-28">
        <div className="container-content flex flex-col gap-14">
          <AnimateIn>
            <SectionTitle
              eyebrow={t('shop.goods.eyebrow')}
              title={t('shop.goods.title')}
            />
          </AnimateIn>

          {hasGoods ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-12">
              {goodsProducts.map((p, i) => (
                <AnimateIn key={p.id} delay={i * 60}>
                  <ProductCard product={p} locale={locale} variant="grid" />
                </AnimateIn>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-12 opacity-40 pointer-events-none select-none">
                {goodsProducts.map((p) => (
                  <ProductCard key={p.id} product={p} locale={locale} variant="grid" />
                ))}
              </div>
              <p className="text-center text-sm tracking-[0.3em] text-ink/40 -mt-4">
                {t('shop.comingSoon')}
              </p>
            </>
          )}
        </div>
      </section>

      <WaveDivider fill="#d5e9f7" />

      {/* ── Seasonal ─────────────────────────────────────────────────── */}
      <section className="bg-sea-100 py-20 md:py-28">
        <div className="container-content flex flex-col gap-14">
          <AnimateIn>
            <SectionTitle
              eyebrow={t('shop.seasonal.eyebrow')}
              title={t('shop.seasonal.title')}
            />
          </AnimateIn>

          {hasSeasonal ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-12">
              {seasonalProducts.map((p, i) => (
                <AnimateIn key={p.id} delay={i * 60}>
                  <ProductCard product={p} locale={locale} variant="grid" />
                </AnimateIn>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-12 opacity-40 pointer-events-none select-none">
                {seasonalProducts.map((p) => (
                  <ProductCard key={p.id} product={p} locale={locale} variant="grid" />
                ))}
              </div>
              <p className="text-center text-sm tracking-[0.3em] text-ink/40 -mt-4">
                {t('shop.comingSoon')}
              </p>
            </>
          )}
        </div>
      </section>

      <WaveDivider fill="#faf8f4" />

      {/* ── Trust bar ────────────────────────────────────────────────── */}
      <section className="bg-paper-50 py-16 md:py-20">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              { icon: '❄️', title: '冷凍配送',        sub: '黑貓宅急便冷凍宅配，確保品質' },
              { icon: '🚚', title: '固定運費 NT$120', sub: '全台宅配，1–3 個工作天送達' },
              { icon: '🎁', title: '精心包裝',        sub: '職人用心包裝，完整呈現每份美味' },
            ].map(({ icon, title, sub }, i) => (
              <AnimateIn key={title} delay={i * 100}>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-4xl">{icon}</span>
                  <p className="font-sans tracking-widest text-ink text-base font-medium">{title}</p>
                  <p className="text-sm text-ink/55 tracking-wide leading-relaxed">{sub}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
