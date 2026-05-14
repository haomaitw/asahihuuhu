'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Facebook, Instagram } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { BrandMark } from './BrandMark';

const navItems = [
  { key: 'news',   href: '/news'    },
  { key: 'lineup', href: '/line-up' },
  { key: 'shop',   href: '/shop'    },
  { key: 'faq',    href: '/faq'     },
] as const;

type MobileMenuProps = {
  facebookUrl?:  string | null
  instagramUrl?: string | null
}

export function MobileMenu({ facebookUrl, instagramUrl }: MobileMenuProps = {}) {
  const t        = useTranslations('nav');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const fb = facebookUrl ?? 'https://www.facebook.com/asahihuuhu';
  const ig = instagramUrl ?? 'https://www.instagram.com/asahihuuhu';

  return (
    <>
      {/* ── Hamburger button ─────────────────────────────────────── */}
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden flex h-10 w-10 items-center justify-center text-current transition-opacity duration-200 hover:opacity-70"
      >
        {/* Three-line icon — bottom line shorter (brand detail) */}
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden>
          <path d="M0 1H22M0 7H22M0 13H16" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {/*
        ── Full-screen panel ─────────────────────────────────────────
        Always in the DOM — no conditional mount so images are pre-loaded
        and there is no layout flash. Visibility is controlled entirely by
        CSS transitions on opacity + translateY.
      */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-[opacity,visibility] duration-400 ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Background — slides down from top */}
        <div
          className={`absolute inset-0 bg-paper-50 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
            open ? 'translate-y-0' : '-translate-y-full'
          }`}
        />

        {/* Content layer — sits above the sliding background */}
        <div className="relative h-full flex flex-col">

          {/* ── Top row: logo + close ────────────────────────────── */}
          <div
            className="flex items-center justify-between px-6 py-6 transition-[opacity,transform] duration-400"
            style={{
              transitionDelay: open ? '120ms' : '0ms',
              opacity: open ? 1 : 0,
              transform: open ? 'none' : 'translateY(-8px)',
            }}
          >
            <BrandMark variant="black" className="h-10" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center text-ink transition-opacity duration-200 hover:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          {/* ── Nav items — staggered fade-up ────────────────────── */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-6">
            {navItems.map((item, i) => (
              <Link
                key={item.key}
                href={item.href}
                className="font-sans font-light text-2xl tracking-[0.3em] text-ink transition-colors duration-200 hover:text-sea-500"
                style={{
                  transitionProperty: 'opacity, transform, color',
                  transitionDuration: '0.45s',
                  transitionTimingFunction: 'ease',
                  transitionDelay: open ? `${180 + i * 65}ms` : '0ms',
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(14px)',
                }}
              >
                {t(item.key)}
              </Link>
            ))}
            {/* Order tracking — smaller, subtle */}
            <Link
              href="/track"
              className="font-sans font-light text-sm tracking-[0.35em] text-ink/40 transition-colors duration-200 hover:text-sea-500 mt-2"
              style={{
                transitionProperty: 'opacity, transform, color',
                transitionDuration: '0.45s',
                transitionTimingFunction: 'ease',
                transitionDelay: open ? `${180 + navItems.length * 65}ms` : '0ms',
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(14px)',
              }}
            >
              訂單查詢
            </Link>
          </nav>

          {/* ── Bottom: social + lang ─────────────────────────────── */}
          <div
            className="flex flex-col items-center gap-5 pb-12"
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: '0.4s',
              transitionTimingFunction: 'ease',
              transitionDelay: open ? '540ms' : '0ms',
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            {/* Thin divider */}
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6 bg-ink/15" />
              <div className="h-px w-3 bg-ink/08" />
            </div>

            <div className="flex items-center gap-6 text-ink/40">
              <a
                href={fb}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition-all duration-200 hover:text-ink hover:scale-110"
              >
                <Facebook size={18} />
              </a>
              <a
                href={ig}
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
      </div>
    </>
  );
}
