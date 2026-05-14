import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { WaveDivider } from '@/components/WaveDivider';
import { getFAQs, getSiteSettings } from '@/lib/cms';

export const dynamic = 'force-dynamic'

const STATIC_FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  return {
    title: t('title'),
    description: 'よくある質問 / FAQ / 常見問題 — 朝日夫婦',
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [cmsFaqs, siteSettings] = await Promise.all([
    getFAQs(locale),
    getSiteSettings(locale).catch(() => null),
  ]);

  return <FaqContent cmsFaqs={cmsFaqs} siteSettings={siteSettings as any} />;
}

type CmsFaq = { id: string; question: string; answer: string };

function FaqContent({
  cmsFaqs,
  siteSettings,
}: {
  cmsFaqs: CmsFaq[] | null
  siteSettings: Record<string, any> | null
}) {
  const t = useTranslations('faq');

  const address = siteSettings?.address ?? '251 新北市淡水區中正路 233-3 號';
  const phone = siteSettings?.phone ?? '';
  const hoursWeekday = siteSettings?.hoursWeekday ?? '週二—週日　12:00–20:00';
  const hoursWeekend = siteSettings?.hoursWeekend ?? '';
  const hoursClosed = siteSettings?.hoursClosed ?? '週一公休';
  const googleMapsUrl = siteSettings?.googleMapsUrl ?? '';
  const hoursLines = [hoursWeekday, hoursWeekend, hoursClosed].filter(Boolean).join('\n');

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={t('title')}
        media={{ kind: 'image', src: '/asahi/hero-faq.png' }}
      />

      <WaveDivider fill="#FBF8F3" />

      {/* Store info */}
      <section className="bg-paper-50 pt-20 pb-6">
        <div className="container-content max-w-2xl">
          <p className="font-averia text-[10px] tracking-[0.28em] text-ink/35 uppercase mb-8">店家資訊</p>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="font-sans text-xs tracking-widest text-ink/40 uppercase mb-3">Address</p>
              <p className="font-sans font-light text-sm text-ink/70 leading-relaxed">{address}</p>
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 font-sans font-light text-sm text-ink/60 hover:text-sea-600 transition-colors"
                >
                  {phone}
                </a>
              )}
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sea-500 hover:text-sea-400 transition-colors mt-1"
                >
                  Google Maps →
                </a>
              )}
            </div>
            <div className="space-y-2">
              <p className="font-sans text-xs tracking-widest text-ink/40 uppercase mb-3">Hours</p>
              <p className="font-sans font-light text-sm text-ink/70 leading-relaxed whitespace-pre-line">
                {hoursLines}
              </p>
            </div>
          </div>
          <div className="mt-10 border-t border-ink/[0.06]" />
        </div>
      </section>

      <section className="bg-paper-50 py-16">
        <div className="container-content max-w-2xl flex flex-col gap-4">
          <p className="font-averia text-[10px] tracking-[0.28em] text-ink/35 uppercase mb-2">常見問題</p>
          {cmsFaqs && cmsFaqs.length > 0 ? (
            cmsFaqs.map((faq) => (
              <FaqItem key={faq.id} q={faq.question} a={faq.answer} />
            ))
          ) : (
            STATIC_FAQ_KEYS.map((k) => (
              <FaqItem
                key={k}
                q={t(`items.${k}.q`)}
                a={t(`items.${k}.a`)}
              />
            ))
          )}
        </div>
      </section>
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details
      className="group rounded-card border border-ink/[0.08] bg-white overflow-hidden
                 transition-shadow duration-200 hover:shadow-sm open:shadow-sm open:border-sea-200"
    >
      <summary
        className="flex cursor-pointer list-none select-none items-center justify-between
                   px-6 py-5 text-sm font-medium text-ink transition-colors duration-200
                   hover:text-sea-600 group-open:text-sea-600"
      >
        <span className="tracking-wide">{q}</span>
        <span className="ml-4 shrink-0 text-xl leading-none text-sea-400 transition-transform duration-300 group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-6 pb-6 pt-1">
        <p className="body-text border-t border-ink/[0.06] pt-4">{a}</p>
      </div>
    </details>
  );
}
