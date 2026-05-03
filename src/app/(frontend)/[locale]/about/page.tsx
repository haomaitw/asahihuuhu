import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { SectionTitle } from '@/components/SectionTitle';
import { WaveDivider } from '@/components/WaveDivider';
import { getAboutPageGlobal, getSiteSettings } from '@/lib/cms';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('title'), description: t('description') };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [aboutData, siteSettings] = await Promise.all([
    getAboutPageGlobal(locale),
    getSiteSettings(locale),
  ]);

  return <AboutContent aboutData={aboutData} siteSettings={siteSettings} />;
}

function AboutContent({
  aboutData,
  siteSettings,
}: {
  aboutData: Record<string, unknown> | null;
  siteSettings: Record<string, unknown> | null;
}) {
  const t = useTranslations('about');

  const p1 = (aboutData?.storyP1 as string) || t('story.p1');
  const p2 = (aboutData?.storyP2 as string) || t('story.p2');
  const p3 = (aboutData?.storyP3 as string) || t('story.p3');

  const address = (siteSettings?.address as string) || t('location.body');
  const hoursWeekday = (siteSettings?.hoursWeekday as string) || '';
  const hoursClosed = (siteSettings?.hoursClosed as string) || '';
  const hoursText = hoursWeekday
    ? `${hoursWeekday}\n${hoursClosed}`.trim()
    : t('hours.body');

  return (
    <>
      <PageHero
        eyebrow="About"
        title={t('title')}
        description={t('description')}
        media={{
          kind: 'video',
          mp4: '/asahi/hero-about.mp4',
          webm: '/asahi/hero-about.webm',
          poster: '/asahi/hero-about-poster.jpg',
        }}
      />

      <WaveDivider fill="#FBF8F3" />

      <section className="bg-paper-50 py-24">
        <div className="container-content flex flex-col items-center gap-12">
          <SectionTitle eyebrow={t('story.eyebrow')} title={t('story.title')} />
          <div className="max-w-2xl space-y-6 text-center">
            <p className="body-text">{p1}</p>
            <p className="body-text">{p2}</p>
            <p className="body-text">{p3}</p>
          </div>
        </div>
      </section>

      <WaveDivider fill="#E4F0F6" />

      <section className="bg-sea-100 py-24">
        <div className="container-content grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="sub-heading mb-4">{t('location.title')}</h3>
            <p className="body-text whitespace-pre-line">{address}</p>
          </div>
          <div>
            <h3 className="sub-heading mb-4">{t('hours.title')}</h3>
            <p className="body-text whitespace-pre-line">{hoursText}</p>
          </div>
        </div>
      </section>
    </>
  );
}
