'use client'
/**
 * BackToTop
 *
 * Fixed bottom-right button that appears after 400 px of scroll.
 * Displays a scroll-progress ring (sea-400) around the original
 * 朝日夫婦 ice-shaving icon (public/asahi/icon-gototop-ice.png).
 * Clicking scrolls smoothly to the top.
 */

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

const R = 18
const C = 2 * Math.PI * R // ≈ 113.097

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [pct,     setPct]     = useState(0)

  const onScroll = useCallback(() => {
    const scrollY = window.scrollY
    const docH    = document.documentElement.scrollHeight - window.innerHeight
    setPct(docH > 0 ? Math.min((scrollY / docH) * 100, 100) : 0)
    setVisible(scrollY > 400)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const dash = (pct / 100) * C

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到頂端"
      className={[
        'fixed bottom-8 right-5 z-50 h-14 w-14',
        'flex items-center justify-center',
        'transition-all duration-500 ease-out',
        'hover:-translate-y-1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea-400',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none',
      ].join(' ')}
    >
      {/* Progress ring */}
      <svg
        width="56"
        height="56"
        viewBox="0 0 56 56"
        className="-rotate-90 absolute inset-0"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="28" cy="28" r={R}
          fill="none"
          stroke="rgba(90,160,215,0.18)"
          strokeWidth="2.5"
        />
        {/* Progress */}
        <circle
          cx="28" cy="28" r={R}
          fill="none"
          stroke="#5aa0d7"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          className="transition-[stroke-dasharray] duration-150"
        />
      </svg>

      {/* White circle + ice icon (original brand asset) */}
      <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
        <Image
          src="/asahi/675c05daa02cdfd9389e08e1_icon-gototop-ice.png"
          alt=""
          width={22}
          height={28}
          className="object-contain"
          aria-hidden
        />
      </span>
    </button>
  )
}
