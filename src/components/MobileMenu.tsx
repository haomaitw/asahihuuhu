'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Facebook, Instagram } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { BrandMark } from './BrandMark';

const navItems = [
  { key: 'news', href: '/news' },
  { key: 'lineup', href: '/line-up' },
  { key: 'shop', href: '/shop' },
  { key: 'about', href: '/about' },
  { key: 'faq', href: '/faq' },
] as const;

export function MobileMenu() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden flex h-10 w-10 items-center justify-center text-white transition-opacity duration-200 hover:opacity-70"
      >
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden>
          <path d="M0 1H22M0 7H22M0 13H16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-paper-50 flex flex-col md:hidden">
          <div className="flex items-center justify-between px-6 py-6">
            <BrandMark variant="black" className="h-12" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center text-ink transition-opacity duration-200 hover:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-8 text-ink">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="font-serif text-xl tracking-[0.3em] transition-colors duration-200 hover:text-sea-500"
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-6 pb-12">
            <div className="flex items-center gap-6 text-ink/60">
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
          </div>
        </div>
      )}
    </>
  );
}
