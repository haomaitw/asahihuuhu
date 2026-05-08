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
    getAboutPageGlobal(locale).catch(() => null),
    getSiteSettings(locale).catch(() => null),
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

  const address = (siteSettings?.address as string) || '251 新北市淡水區中正路 233-3 號';
  const phone = (siteSettings?.phone as string) || '';
  const lineId = (siteSettings?.lineId as string) || '';
  const hoursWeekday = (siteSettings?.hoursWeekday as string) || '';
  const hoursWeekend = (siteSettings?.hoursWeekend as string) || '';
  const hoursClosed = (siteSettings?.hoursClosed as string) || '';
  const googleMapsUrl = (siteSettings?.googleMapsUrl as string) || '';
  const googleMapsEmbed = (siteSettings?.googleMapsEmbed as string) || '';

  const hoursLines = [hoursWeekday, hoursWeekend, hoursClosed].filter(Boolean).join('\n');
  const hoursText = hoursLines || t('hours.body');

  // Use CMS hero video if set, otherwise fall back to static files
  const cmsVideoUrl  = (aboutData?.heroVideo  as any)?.url  as string | undefined
  const cmsPosterUrl = (aboutData?.heroPoster as any)?.url as string | undefined

  return (
    <>
      <PageHero
        eyebrow="About"
        title={t('title')}
        description={t('description')}
        media={{
          kind: 'video',
          mp4: cmsVideoUrl ?? '/asahi/hero-about.mp4',
          webm: cmsVideoUrl ? undefined : '/asahi/hero-about.webm',
          poster: cmsPosterUrl ?? '/asahi/hero-about-poster.jpg',
        }}
      />

      <WaveDivider fill="#FBF8F3" />

      {/* Story */}
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

      {/* Location & Hours */}
      <section className="bg-sea-100 py-24">
        <div className="container-content grid md:grid-cols-2 gap-12 items-start">
          {/* Location */}
          <div className="space-y-4">
            <h3 className="sub-heading">{t('location.title')}</h3>
            <p className="body-text whitespace-pre-line">{address}</p>
            <div className="flex flex-col gap-2 text-sm text-ink/70">
              {phone && (
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2 hover:text-ink transition-colors">
                  <span className="text-sea-500">☎</span>
                  {phone}
                </a>
              )}
              {lineId && (
                <a href={`https://line.me/ti/p/${lineId.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-ink transition-colors">
                  <span className="text-sea-500">LINE</span>
                  {lineId}
                </a>
              )}
            </div>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-xs tracking-widest text-brand-700 border border-brand-200 bg-white px-4 py-2.5 rounded-xl hover:bg-brand-50 transition-colors"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Google Maps 導航
              </a>
            )}
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="sub-heading">{t('hours.title')}</h3>
            <p className="body-text whitespace-pre-line">{hoursText}</p>
          </div>
        </div>

        {/* Google Maps embed */}
        {googleMapsEmbed && (
          <div className="container-content mt-12">
            <div className="rounded-3xl overflow-hidden shadow-sm aspect-[16/7]">
              <iframe
                src={googleMapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="朝日夫婦地圖"
              />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
