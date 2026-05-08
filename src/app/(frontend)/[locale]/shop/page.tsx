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
import { getShopPageGlobal } from '@/lib/cms';

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

  const [cmsProducts, shopPage] = await Promise.all([
    getProducts(locale).catch(() => [] as Awaited<ReturnType<typeof getProducts>>),
    getShopPageGlobal(locale).catch(() => null),
  ]);

  const goods    = cmsProducts.filter((p) => p.category === 'goods');
  const seasonal = cmsProducts.filter((p) => p.category === 'seasonal');

  const heroImageUrl = (shopPage as any)?.heroImage?.url ?? null;
  const trustItems   = (shopPage as any)?.trustItems ?? null;

  return (
    <ShopContent
      goods={goods.length ? goods : null}
      seasonal={seasonal.length ? seasonal : null}
      heroImageUrl={heroImageUrl}
      trustItems={trustItems}
    />
  );
}

type ShopProduct = {
  id: string; name: string; slug?: string; image: string;
  price?: number; comparePrice?: number; shortDescription?: string;
  stock?: number; trackStock?: boolean;
}

type TrustItem = { icon?: string; title?: string; description?: string }

const DEFAULT_TRUST_ITEMS: TrustItem[] = [
  { icon: '❄️', title: '冷凍配送',        description: '黑貓宅急便冷凍宅配，確保品質' },
  { icon: '🚚', title: '固定運費 NT$120', description: '全台宅配，1–3 個工作天送達' },
  { icon: '🎁', title: '精心包裝',        description: '職人用心包裝，完整呈現每份美味' },
]

function ShopContent({
  goods,
  seasonal,
  heroImageUrl,
  trustItems,
}: {
  goods: ShopProduct[] | null
  seasonal: ShopProduct[] | null
  heroImageUrl?: string | null
  trustItems?: TrustItem[] | null
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
        media={{ kind: 'image', src: heroImageUrl ?? '/asahi/hero-shop.png' }}
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
            {(trustItems?.length ? trustItems : DEFAULT_TRUST_ITEMS).map(({ icon, title, description }, i) => (
              <AnimateIn key={i} delay={i * 100}>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-4xl">{icon}</span>
                  <p className="font-sans font-medium tracking-widest text-ink text-base">{title}</p>
                  <p className="font-sans font-light text-sm text-ink/55 tracking-wide leading-relaxed">{description}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
