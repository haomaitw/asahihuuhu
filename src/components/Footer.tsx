import { useTranslations } from 'next-intl';
import { Facebook, Instagram } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { BrandMark } from './BrandMark';

const footerLinks = [
  { key: 'news',    href: '/news'     },
  { key: 'lineup',  href: '/line-up'  },
  { key: 'about',   href: '/about'    },
  { key: 'shop',    href: '/shop'     },
  { key: 'faq',     href: '/faq'      },
  { key: 'privacy', href: '/privacy'  },
] as const;

type FooterProps = {
  facebookUrl?:  string | null
  instagramUrl?: string | null
  copyright?:    string | null
}

export function Footer({ facebookUrl, instagramUrl, copyright }: FooterProps = {}) {
  const t    = useTranslations();
  const year = new Date().getFullYear();

  const fb = facebookUrl  ?? 'https://www.facebook.com/asahihuuhu';
  const ig = instagramUrl ?? 'https://www.instagram.com/asahihuuhu';

  return (
    <footer className="relative bg-paper-50 border-t border-paper-200 pt-20 pb-12">
      <div className="container-content flex flex-col items-center gap-8">

        {/* Logo */}
        <BrandMark variant="black" className="h-20 md:h-24" />

        {/* Social icons */}
        <div className="flex items-center gap-6 text-ink/40">
          {fb && (
            <a
              href={fb}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-all duration-300 hover:text-sea-400 hover:scale-110"
            >
              <Facebook size={20} />
            </a>
          )}
          {ig && (
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-all duration-300 hover:text-sea-400 hover:scale-110"
            >
              <Instagram size={20} />
            </a>
          )}
        </div>

        {/* Language switcher */}
        <LangSwitcher variant="footer" />

        {/* Nav links — Noto Sans TC light, matching original tracking */}
        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {footerLinks.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="font-sans font-light text-sm tracking-[0.22em] text-ink/50 transition-colors duration-300 hover:text-sea-400"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p className="font-sans font-light text-xs tracking-[0.25em] text-ink/35 mt-2">
          ©{year} {copyright ?? 'ASAHI HUUHU. All Rights Reserved.'}
        </p>
      </div>
    </footer>
  );
}
