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

export function Header() {
  const t = useTranslations('nav')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    // Set initial state
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const textColor    = scrolled ? 'text-ink'       : 'text-white'
  const textColorSub = scrolled ? 'text-ink/60'    : 'text-white/70'
  const hoverColor   = scrolled ? 'hover:text-ink' : 'hover:text-white'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${
        scrolled
          ? 'bg-paper-50/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container-content flex items-center justify-between py-4 md:py-5">

        {/* ── Logo (appears once scrolled) ──────────────────────────── */}
        <div
          className={`transition-all duration-500 ${
            scrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
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
              className={`nav-link font-averia text-xs tracking-[0.28em] transition-colors duration-300 ${
                scrolled ? 'opacity-70 hover:opacity-100' : 'opacity-80 hover:opacity-100'
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
            <a
              href="https://www.facebook.com/asahihuuhu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className={`transition-all duration-300 ${hoverColor} hover:scale-110`}
            >
              <Facebook size={15} />
            </a>
            <a
              href="https://www.instagram.com/asahihuuhu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={`transition-all duration-300 ${hoverColor} hover:scale-110`}
            >
              <Instagram size={15} />
            </a>
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
