import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { menu } from '@/lib/menu-data';

export function MenuAnchorBar() {
  const t = useTranslations();

  return (
    <div className="bg-paper-50 py-10 md:py-12">
      <div className="container-content">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {menu.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="group flex flex-col items-center gap-3 rounded-card bg-white py-7 px-4
                         border border-ink/[0.05] shadow-sm
                         transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md hover:border-sea-200"
            >
              <div className="relative h-16 w-16 transition-transform duration-300 group-hover:scale-110">
                <Image src={cat.anchorIcon} alt="" fill sizes="64px" className="object-contain" />
              </div>
              <span className="section-eyebrow text-[9px]">{cat.labelKey}</span>
              <span className="font-serif text-sm tracking-[0.2em] text-ink transition-colors duration-200 group-hover:text-sea-600">
                {t(cat.titleKey)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
