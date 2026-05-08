'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Facebook, Instagram } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { LangSwitcher } from './LangSwitcher'
import { MobileMenu } from './MobileMenu'
import { CartButton } from './CartButton'
import { HeaderAccountButton } from './HeaderAccountButton'
import { BrandMark } from './BrandMark'

const navItems = [
  { key: 'news',   href: '/news'    },
  { key: 'lineup', href: '/line-up' },
  { key: 'shop',   href: '/shop'    },
  { key: 'about',  href: '/about'   },
  { key: 'faq',    href: '/faq'     },
] as const

type HeaderProps = {
  facebookUrl?: string | null
  instagramUrl?: string | null
}

export function Header({ facebookUrl, instagramUrl }: HeaderProps = {}) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  // Home page paths are /<locale> with nothing after (zh-TW, en, ja)
  const isHome = /^\/(zh-TW|en|ja)\/?$/.test(pathname)

  // On non-home pages, always act as if scrolled (paper background, dark text, logo visible)
  const active = !isHome || scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    // Set initial state
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const textColor    = active ? 'text-ink'         : 'text-white'
  const textColorSub = active ? 'text-ink/75'      : 'text-white/70'
  const hoverColor   = active ? 'hover:text-sea-500' : 'hover:text-white'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${
        active
          ? 'bg-paper-50/96 backdrop-blur-md shadow-sm border-b border-paper-200'
          : 'bg-transparent'
      }`}
    >
      <div className="container-content flex items-center justify-between py-4 md:py-5">

        {/* ── Logo (home: appears on scroll; other pages: always visible) ── */}
        <div
          className={`transition-all duration-500 ${
            active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
          }`}
        >
          <Link href="/" aria-label="朝日夫婦">
            <BrandMark variant="black" className="h-8 md:h-9" />
          </Link>
        </div>

        {/* ── Desktop nav ───────────────────────────────────────────── */}
        <nav className={`hidden md:flex items-center gap-8 ${textColor}`}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-link font-sans font-light text-xs tracking-[0.28em] transition-all duration-300 ${
                active
                  ? 'text-ink hover:text-sea-500'
                  : 'opacity-85 hover:opacity-100'
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* ── Right utilities ───────────────────────────────────────── */}
        <div className={`flex items-center gap-3 ${textColor}`}>
          {/* Social icons */}
          <div className={`hidden md:flex items-center gap-3 ${textColorSub}`}>
            {(facebookUrl ?? 'https://www.facebook.com/asahihuuhu') && (
              <a
                href={facebookUrl ?? 'https://www.facebook.com/asahihuuhu'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={`transition-all duration-300 ${hoverColor} hover:scale-110`}
              >
                <Facebook size={15} />
              </a>
            )}
            {(instagramUrl ?? 'https://www.instagram.com/asahihuuhu') && (
              <a
                href={instagramUrl ?? 'https://www.instagram.com/asahihuuhu'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`transition-all duration-300 ${hoverColor} hover:scale-110`}
              >
                <Instagram size={15} />
              </a>
            )}
          </div>
          <div className="hidden md:block">
            <LangSwitcher variant="header" />
          </div>
          <HeaderAccountButton />
          <CartButton />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
