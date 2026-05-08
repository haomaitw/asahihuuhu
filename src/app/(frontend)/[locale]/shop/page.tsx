import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { SectionTitle } from '@/components/SectionTitle';
import { WaveDivider } from '@/components/WaveDivider';
import { ProductCard } from '@/components/ProductCard';
import { placeholderProducts } from '@/lib/placeholder-data';
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
    // DB not ready or no products yet — fall back to placeholders
  }

  return <ShopContent cmsProducts={cmsProducts} locale={locale} />;
}

function ShopContent({
  cmsProducts,
  locale,
}: {
  cmsProducts: Awaited<ReturnType<typeof getProducts>>;
  locale: string;
}) {
  const t = useTranslations();
  const hasRealProducts = cmsProducts.length > 0;
  const placeholders = placeholderProducts.map((p) => ({ ...p, name: t(p.name as any) }));

  return (
    <>
      <PageHero
        eyebrow="Shop"
        title={t('shop.title')}
        description={t('shop.description')}
        media={{ kind: 'image', src: '/asahi/hero-shop.png' }}
      />
      <WaveDivider fill="#FBF8F3" />
      <section className="bg-paper-50 py-24">
        <div className="container-content flex flex-col gap-12">
          <SectionTitle eyebrow={t('shop.goods.eyebrow')} title={t('shop.goods.title')} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12 justify-items-center">
            {hasRealProducts
              ? cmsProducts.map((p) => <ProductCard key={p.id} product={p} locale={locale} />)
              : placeholders.map((p) => <ProductCard key={p.id} product={p} locale={locale} />)}
          </div>
          {!hasRealProducts && (
            <p className="text-center text-xs tracking-widest text-ink/50">
              {t('shop.comingSoon')}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
