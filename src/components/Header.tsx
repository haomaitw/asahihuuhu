'use client'

import { useState, useEffect } from 'react'
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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Header bg: paper when scrolled, transparent at top (all pages)
  const hasPaper = scrolled

  // Logo & text colour: white on transparent dark-hero, ink on paper bg
  const logoVariant  = hasPaper ? 'black'              : 'white'
  const textColor    = hasPaper ? 'text-ink'           : 'text-white'
  const textColorSub = hasPaper ? 'text-ink/75'        : 'text-white/70'
  const hoverColor   = hasPaper ? 'hover:text-sea-500' : 'hover:text-white'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${
        hasPaper
          ? 'bg-paper-50/96 backdrop-blur-md shadow-sm border-b border-paper-200'
          : 'bg-transparent'
      }`}
    >
      <div className="container-content flex items-center justify-between py-4 md:py-5">

        {/* ── Logo — always visible; white on dark hero, black on paper ── */}
        <Link href="/" aria-label="朝日夫婦" className="transition-opacity duration-300 hover:opacity-75">
          <BrandMark variant={logoVariant} className="h-8 md:h-9" />
        </Link>

        {/* ── Desktop nav ───────────────────────────────────────────── */}
        <nav className={`hidden md:flex items-center gap-8 ${textColor}`}>
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-link font-sans font-light text-sm tracking-[0.25em] transition-all duration-300 ${
                hasPaper
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
