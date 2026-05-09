import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { WaveDivider } from '@/components/WaveDivider';
import { NewsItem } from '@/components/NewsItem';
import { placeholderNews } from '@/lib/placeholder-data';
import { getNewsItems } from '@/lib/cms';

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news' });
  return { title: t('title') };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cmsNews = await getNewsItems(locale);

  return <NewsContent cmsNews={cmsNews} />;
}

type CmsNewsItem = { slug: string; date: string; title: string };

function NewsContent({ cmsNews }: { cmsNews: CmsNewsItem[] | null }) {
  const t = useTranslations();

  const news = cmsNews && cmsNews.length > 0
    ? cmsNews
    : placeholderNews.map((n) => ({ ...n, title: t(n.title) }));

  return (
    <>
      <PageHero
        eyebrow="News"
        title={t('news.title')}
        media={{ kind: 'image', src: '/asahi/hero-shop.png' }}
      />

      <WaveDivider fill="#FBF8F3" />

      <section className="bg-paper-50 py-24">
        <div className="container-content max-w-2xl">
          {news.map((entry) => (
            <NewsItem key={entry.slug} entry={entry} />
          ))}
        </div>
      </section>
    </>
  );
}
