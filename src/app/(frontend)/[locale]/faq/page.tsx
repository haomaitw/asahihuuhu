import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { WaveDivider } from '@/components/WaveDivider';
import { getFAQs } from '@/lib/cms';

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

  const cmsFaqs = await getFAQs(locale);

  return <FaqContent cmsFaqs={cmsFaqs} />;
}

type CmsFaq = { id: string; question: string; answer: string };

function FaqContent({ cmsFaqs }: { cmsFaqs: CmsFaq[] | null }) {
  const t = useTranslations('faq');

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={t('title')}
        media={{ kind: 'image', src: '/asahi/hero-faq.png' }}
      />

      <WaveDivider fill="#FBF8F3" />

      <section className="bg-paper-50 py-24">
        <div className="container-content max-w-2xl flex flex-col gap-4">
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
