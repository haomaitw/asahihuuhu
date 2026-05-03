import { useTranslations } from 'next-intl';
import { Facebook, Instagram } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { MobileMenu } from './MobileMenu';
import { CartButton } from './CartButton';

const navItems = [
  { key: 'news', href: '/news' },
  { key: 'lineup', href: '/line-up' },
  { key: 'shop', href: '/shop' },
  { key: 'about', href: '/about' },
  { key: 'faq', href: '/faq' },
] as const;

export function Header() {
  const t = useTranslations('nav');

  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="container-content flex items-center justify-end gap-6 py-6 text-sm text-white">
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href} className="nav-link opacity-90 text-xs tracking-[0.25em]">
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3 text-white/80">
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="transition-all duration-200 hover:text-white hover:scale-110"
          >
            <Facebook size={15} />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="transition-all duration-200 hover:text-white hover:scale-110"
          >
            <Instagram size={15} />
          </a>
        </div>
        <div className="hidden md:block">
          <LangSwitcher variant="header" />
        </div>
        <CartButton />
        <MobileMenu />
      </div>
    </header>
  );
}
