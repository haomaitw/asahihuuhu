'use client'

import { useEffect, useState, useCallback } from 'react'

const R = 18
const C = 2 * Math.PI * R // ≈ 113.097

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [pct, setPct] = useState(0)

  const onScroll = useCallback(() => {
    const scrollY = window.scrollY
    const docH = document.documentElement.scrollHeight - window.innerHeight
    const progress = docH > 0 ? Math.min((scrollY / docH) * 100, 100) : 0

    setVisible(scrollY > 400)
    setPct(progress)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const dash = (pct / 100) * C

  return (
    <button
      onClick={scrollToTop}
      aria-label="回到頂端"
      className={[
        'fixed bottom-8 right-6 z-50 h-12 w-12',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea-400',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
      ].join(' ')}
    >
      {/* Progress ring SVG */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="-rotate-90 absolute inset-0"
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="rgba(90,160,215,0.2)"
          strokeWidth="3"
        />
        {/* Progress ring */}
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="#5aa0d7"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
        />
      </svg>

      {/* Inner filled circle with arrow */}
      <span
        className={[
          'absolute inset-1.5 flex items-center justify-center rounded-full',
          'bg-sea-400 text-white',
          'transition-colors duration-200',
          'hover:bg-sea-500',
          'group',
        ].join(' ')}
        aria-hidden="true"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2,9 7,4 12,9" />
        </svg>
      </span>
    </button>
  )
}
