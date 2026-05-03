'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import clsx from 'clsx';

const labels: Record<string, string> = {
  'zh-TW': 'TW',
  en: 'EN',
  ja: 'JP',
};

const order = ['zh-TW', 'en', 'ja'] as const;

export function LangSwitcher({
  variant = 'header',
}: {
  variant?: 'header' | 'footer';
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const baseColor = variant === 'header' ? 'text-white/70' : 'text-ink/50';
  const activeColor = variant === 'header' ? 'text-white' : 'text-ink';

  return (
    <div className={clsx('flex items-center gap-1 text-[10px] tracking-[0.2em]', baseColor)}>
      {order.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: l })}
            className={clsx(
              'transition-all duration-200 hover:opacity-100 px-0.5',
              locale === l ? `${activeColor} font-semibold` : 'opacity-60 hover:opacity-80'
            )}
          >
            {labels[l]}
          </button>
          {i < order.length - 1 && <span className="opacity-30">/</span>}
        </span>
      ))}
    </div>
  );
}
