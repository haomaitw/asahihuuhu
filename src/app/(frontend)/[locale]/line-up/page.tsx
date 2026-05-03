import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { WaveDivider } from '@/components/WaveDivider';
import { MenuAnchorBar } from '@/components/MenuAnchorBar';
import { MenuSection } from '@/components/MenuSection';
import { menu } from '@/lib/menu-data';

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
  return <LineUpContent />;
}

function LineUpContent() {
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

      {menu.map((cat, idx) => (
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
