import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { PageHero } from '@/components/PageHero';
import { WaveDivider } from '@/components/WaveDivider';
import { MenuAnchorBar } from '@/components/MenuAnchorBar';
import { MenuSection } from '@/components/MenuSection';
import { menu } from '@/lib/menu-data';
import { getMenuItems } from '@/lib/firestore/admin';
import type { MenuCategory, MenuItem } from '@/lib/menu-data';

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'lineup' });
  return { title: t('title'), description: t('description') };
}

export default async function LineUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Try Firestore CMS items first; fall back to static menu-data
  let cmsItems: any[] = []
  try {
    cmsItems = await getMenuItems(locale as any)
  } catch {
    // fallback to static
  }

  // If CMS has items, build dynamic categories from them
  let resolvedMenu: MenuCategory[] = menu
  if (cmsItems.length > 0) {
    const categoryOrder = ['kakigori', 'crepes', 'drinks', 'goods']
    resolvedMenu = categoryOrder.map((catId) => {
      const base = menu.find((c) => c.id === catId)
      const items: MenuItem[] = cmsItems
        .filter((i) => i.category === catId)
        .map((i) => ({
          id: i.id,
          nameKey: i.name, // already localized string, handled below
          image: i.image ?? undefined,
          badge: i.badge ?? undefined,
          _resolvedName: i.name, // stash for rendering
        } as any))
      if (!base) return null
      return { ...base, items: items.length > 0 ? items : base.items }
    }).filter(Boolean) as MenuCategory[]
  }

  return <LineUpContent resolvedMenu={resolvedMenu} />
}

function LineUpContent({ resolvedMenu }: { resolvedMenu: MenuCategory[] }) {
  const t = useTranslations();

  return (
    <>
      <PageHero
        eyebrow="Line up"
        title={t('lineup.title')}
        description={t('lineup.description')}
        media={{
          kind: 'video',
          mp4: '/asahi/hero-lineup.mp4',
          webm: '/asahi/hero-lineup.webm',
          poster: '/asahi/hero-lineup-poster.jpg',
        }}
      />

      <WaveDivider fill="#FBF8F3" />

      <MenuAnchorBar />

      {resolvedMenu.map((cat, idx) => (
        <div
          key={cat.id}
          className={idx % 2 === 0 ? 'bg-paper-50' : 'bg-sea-100'}
        >
          {idx > 0 && (
            <WaveDivider fill={idx % 2 === 0 ? '#FBF8F3' : '#E4F0F6'} />
          )}
          <MenuSection category={cat} />
        </div>
      ))}
    </>
  );
}
