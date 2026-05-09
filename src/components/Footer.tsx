import { useTranslations } from 'next-intl';
import { Facebook, Instagram, MapPin, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { BrandMark } from './BrandMark';

/* ── nav / policy link lists ────────────────────────────────────────── */
const navLinks = [
  { key: 'news',   href: '/news'    },
  { key: 'lineup', href: '/line-up' },
  { key: 'shop',   href: '/shop'    },
  { key: 'about',  href: '/about'   },
  { key: 'faq',    href: '/faq'     },
] as const;

const policyLinks = [
  { key: 'privacy', href: '/privacy' },
  { key: 'terms',   href: '/terms'   },
  { key: 'returns', href: '/returns' },
] as const;

/* ── footer bg colour (matches sea-900) ─────────────────────────────── */
const DARK = '#16364f';

type FooterProps = {
  facebookUrl?:  string | null
  instagramUrl?: string | null
  copyright?:    string | null
}

export function Footer({ facebookUrl, instagramUrl, copyright }: FooterProps = {}) {
  const t    = useTranslations('nav');
  const year = new Date().getFullYear();

  const fb = facebookUrl  ?? 'https://www.facebook.com/asahihuuhu';
  const ig = instagramUrl ?? 'https://www.instagram.com/asahihuuhu';

  return (
    <footer>

      {/*
        ── Wave transition ─────────────────────────────────────────────
        Sits in the paper-50 zone; SVG path fills with DARK so the
        harbour-dark footer "rises" out of the content area.
      */}
      <div className="bg-paper-50 leading-[0]">
        <svg
          viewBox="0 0 1440 64"
          className="w-full block"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,16 1440,32 L1440,64 L0,64 Z"
            fill={DARK}
          />
        </svg>
      </div>

      {/* ── Dark main body ────────────────────────────────────────────── */}
      <div style={{ background: DARK }} className="text-white/70">

        {/* ── Three-column editorial grid ───────────────────────────── */}
        <div className="container-content pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">

            {/* ── Brand column ──────────────────────────────────────── */}
            <div className="md:col-span-5 space-y-6">
              <BrandMark variant="white" className="h-11 opacity-85" />

              <p className="font-sans font-light text-sm leading-relaxed tracking-[0.04em] text-white/45 max-w-[280px]">
                職人堅持的日式刨冰，以沖繩記憶與台灣食材，在淡水河畔緩緩刨出每一碗綿密如雪的初心。
              </p>

              {/* Store info */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5">
                  <MapPin size={13} className="mt-[3px] shrink-0 text-sea-300/55" />
                  <span className="font-sans font-light text-xs tracking-wide text-white/40">
                    新北市淡水區中正路 233-3 號 1 樓
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock size={13} className="mt-[3px] shrink-0 text-sea-300/55" />
                  <span className="font-sans font-light text-xs tracking-wide text-white/40 whitespace-pre-line">
                    {'週二—週日　12:00–20:00\n週一公休'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Spacer on md+ ─────────────────────────────────────── */}
            <div className="hidden md:block md:col-span-1" />

            {/* ── Navigate column ───────────────────────────────────── */}
            <div className="md:col-span-3 space-y-4">
              <p className="font-averia text-[10px] tracking-[0.28em] text-sea-300/40 uppercase">
                Navigate
              </p>
              <nav className="flex flex-col gap-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="font-sans font-light text-sm tracking-[0.18em] text-white/50 transition-colors duration-200 hover:text-white/90"
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ── Policies + Service column ─────────────────────────── */}
            <div className="md:col-span-3 space-y-4">
              <p className="font-averia text-[10px] tracking-[0.28em] text-sea-300/40 uppercase">
                Policies
              </p>
              <nav className="flex flex-col gap-2">
                {policyLinks.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="font-sans font-light text-sm tracking-[0.18em] text-white/50 transition-colors duration-200 hover:text-white/90"
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </nav>
              <p className="font-averia text-[10px] tracking-[0.28em] text-sea-300/40 uppercase pt-4">
                Service
              </p>
              <nav className="flex flex-col gap-2">
                <Link
                  href="/track"
                  className="font-sans font-light text-sm tracking-[0.18em] text-white/50 transition-colors duration-200 hover:text-white/90"
                >
                  訂單查詢
                </Link>
                <Link
                  href="/account/orders"
                  className="font-sans font-light text-sm tracking-[0.18em] text-white/50 transition-colors duration-200 hover:text-white/90"
                >
                  我的訂單
                </Link>
              </nav>
            </div>

          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="border-t border-white/[0.08]">
          <div className="container-content py-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-0 sm:justify-between">

            {/* Social */}
            <div className="flex items-center gap-5 text-white/30">
              {fb && (
                <a
                  href={fb}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="transition-all duration-200 hover:text-white/80 hover:scale-110"
                >
                  <Facebook size={15} />
                </a>
              )}
              {ig && (
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="transition-all duration-200 hover:text-white/80 hover:scale-110"
                >
                  <Instagram size={15} />
                </a>
              )}
            </div>

            {/* Copyright — centred on desktop */}
            <p className="font-sans font-light text-[11px] tracking-[0.22em] text-white/25">
              ©{year}&nbsp;{copyright ?? 'ASAHI HUUHU. All Rights Reserved.'}
            </p>

            {/* Language switcher */}
            <LangSwitcher variant="footer" />

          </div>
        </div>

      </div>
    </footer>
  );
}
