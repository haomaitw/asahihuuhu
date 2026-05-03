import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { MenuCategory } from '@/lib/menu-data';

export function MenuSection({ category }: { category: MenuCategory }) {
  const t = useTranslations();

  return (
    <section id={category.id} className="container-content py-20 md:py-24 scroll-mt-24">
      <header className="flex flex-col items-center gap-3 mb-14">
        <div className="relative h-14 w-14 opacity-75">
          <Image src={category.anchorIcon} alt="" fill sizes="56px" className="object-contain" />
        </div>
        <span className="section-eyebrow">{category.labelKey}</span>
        <span className="h-px w-10 bg-sea-200" />
        <h2 className="section-heading">{t(category.titleKey)}</h2>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-10 md:gap-y-14 justify-items-center">
        {category.items.map((item) => (
          <article key={item.id} className="group flex flex-col gap-3 w-full max-w-[260px]">
            <div className="product-image-wrap aspect-square">
              {item.image && (
                <Image
                  src={item.image}
                  alt={t(item.nameKey)}
                  fill
                  sizes="(max-width: 768px) 50vw, 260px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {item.badge && (
                <span className="absolute top-2.5 left-2.5 rounded-full bg-sea-400 px-3 py-1 text-[10px] tracking-[0.2em] text-white shadow-sm">
                  {t(`badge.${item.badge}`)}
                </span>
              )}
            </div>
            <div className="flex items-start gap-2 transition-colors duration-200 group-hover:text-ink">
              <span className="text-sea-400 mt-0.5 text-sm">·</span>
              <span className="body-text leading-snug">{t(item.nameKey)}</span>
            </div>
          </article>
        ))}
      </div>

      {category.addOns && category.addOns.length > 0 && (
        <div className="mt-16 rounded-card bg-paper-100 px-6 py-10 md:px-10 md:py-12 border border-ink/[0.04]">
          <h3 className="text-center sub-heading mb-10">{t('lineup.addOns.title')}</h3>
          <div className="grid grid-cols-3 gap-4 md:gap-8 justify-items-center max-w-3xl mx-auto">
            {category.addOns.map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-3 text-center">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={t(item.nameKey)}
                    width={120}
                    height={120}
                    className="object-contain drop-shadow-sm"
                  />
                )}
                <span className="body-text text-xs">{t(item.nameKey)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
