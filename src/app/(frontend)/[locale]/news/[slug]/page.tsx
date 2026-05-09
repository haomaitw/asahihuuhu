import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { WaveDivider } from '@/components/WaveDivider';
import { RichText } from '@/components/RichText';
import { Link } from '@/i18n/routing';
import { getNewsItem } from '@/lib/cms';

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const entry = await getNewsItem(slug, locale);
    if (!entry) return {};
    return {
      title: `${entry.title} — 朝日夫婦`,
      description: (entry as any).excerpt ?? undefined,
    };
  } catch {
    return {};
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let entry: any = null;
  try {
    entry = await getNewsItem(slug, locale);
  } catch {}

  if (!entry) notFound();

  const publishedAt = entry.publishedAt ?? entry.createdAt;

  return (
    <article className="bg-paper-50 pt-32 pb-24">
      <div className="container-content max-w-2xl">
        <Link href="/news" className="text-xs tracking-widest text-sea-500 hover:text-sea-600 transition-colors">
          ← 最新消息
        </Link>
        <header className="mt-8 mb-10 space-y-3">
          {publishedAt && (
            <span className="text-xs tracking-widest text-sea-500 tabular-nums">
              {new Date(publishedAt).toLocaleDateString('zh-TW', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          )}
          <h1 className="font-serif text-2xl md:text-3xl tracking-wider text-ink">
            {entry.title}
          </h1>
          {entry.excerpt && (
            <p className="text-sm text-ink/60 leading-relaxed">{entry.excerpt}</p>
          )}
        </header>

        <div className="prose prose-sm max-w-none text-ink/80 leading-loose">
          {entry.content ? (
            <RichText data={entry.content} />
          ) : (
            <p className="text-ink/50">內容待更新</p>
          )}
        </div>
      </div>
      <WaveDivider flip fill="#FBF8F3" />
    </article>
  );
}
