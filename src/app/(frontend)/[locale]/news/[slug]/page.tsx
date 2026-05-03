import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { WaveDivider } from '@/components/WaveDivider';
import { Link } from '@/i18n/routing';
import { placeholderNews } from '@/lib/placeholder-data';

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const entry = placeholderNews.find((n) => n.slug === slug);
  if (!entry) notFound();

  const t = await getTranslations();

  return (
    <article className="bg-paper-50 pt-32 pb-24">
      <div className="container-content max-w-2xl">
        <Link href="/news" className="text-xs tracking-widest text-sea-500">
          ← {t('news.title')}
        </Link>
        <header className="mt-8 mb-10 space-y-3">
          <span className="text-xs tracking-widest text-sea-500 tabular-nums">
            {entry.date}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wider">
            {t(entry.title)}
          </h1>
        </header>
        <div className="prose prose-sm max-w-none text-ink/80 leading-loose">
          <p>{t('news.placeholderBody')}</p>
        </div>
      </div>
      <WaveDivider flip fill="#FBF8F3" />
    </article>
  );
}
