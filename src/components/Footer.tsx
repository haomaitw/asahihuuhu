import { useTranslations } from 'next-intl';
import { Facebook, Instagram } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { BrandMark } from './BrandMark';

const footerLinks = [
  { key: 'news', href: '/news' },
  { key: 'lineup', href: '/line-up' },
  { key: 'about', href: '/about' },
  { key: 'shop', href: '/shop' },
  { key: 'faq', href: '/faq' },
  { key: 'privacy', href: '/privacy' },
] as const;

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-paper-50 pt-20 pb-10">
      <div className="container-content flex flex-col items-center gap-8">
        <BrandMark variant="black" className="h-20" />
        <div className="flex items-center gap-5 text-ink/50">
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="transition-all duration-200 hover:text-ink hover:scale-110"
          >
            <Facebook size={18} />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="transition-all duration-200 hover:text-ink hover:scale-110"
          >
            <Instagram size={18} />
          </a>
        </div>
        <LangSwitcher variant="footer" />
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] tracking-[0.2em] text-ink/50">
          {footerLinks.map((item) => (
            <Link key={item.key} href={item.href} className="nav-link hover:text-ink">
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        <p className="text-[10px] tracking-widest text-ink/40">
          ©{year} ASAHI HUUHU. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
