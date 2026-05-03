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
      <span className="caption-text shrink-0">{entry.date}</span>
      <span className="body-text transition-colors duration-200 group-hover:text-ink">
        {entry.title}
      </span>
    </Link>
  );
}
