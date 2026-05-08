import { Link } from '@/i18n/routing';

export type NewsEntry = {
  slug: string;
  date: string;
  title: string;
};

export function NewsItem({ entry }: { entry: NewsEntry }) {
  return (
    <Link
      href={`/news/${entry.slug}`}
      className="group flex items-center gap-6 border-b border-ink/10 py-5 px-3 -mx-3
                 rounded-sm transition-all duration-200 hover:bg-paper-100 hover:px-5"
    >
      {/* Date — Averia, brand blue */}
      <span className="font-averia text-sm tracking-[0.2em] text-sea-400 shrink-0 tabular-nums">
        {entry.date}
      </span>
      {/* Title — Noto Sans TC, 16px */}
      <span className="text-base text-ink/75 tracking-wide transition-colors duration-300 group-hover:text-ink">
        {entry.title}
      </span>
    </Link>
  );
}
