'use client'
/**
 * PageTransitionOverlay
 *
 * On every client-side navigation (pathname change), this overlay slides
 * down over the screen — a moonrise-over-harbour scene (deep navy → light
 * aqua) with the brand mark centred and two SVG wave shapes at the bottom —
 * then continues upward off the viewport, revealing the new page beneath.
 *
 * Visual metaphor: the Tamsui harbour at dawn, cool blue light spreading
 * from the horizon, lifting the ocean to uncover the next destination.
 */

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandMark } from './BrandMark'

export function PageTransitionOverlay() {
  const pathname  = usePathname()
  const [animKey, setAnimKey] = useState(0)
  const [show,    setShow]    = useState(false)

  useEffect(() => {
    setShow(true)
    setAnimKey((k) => k + 1)
    const t = setTimeout(() => setShow(false), 950)
    return () => clearTimeout(t)
  }, [pathname])

  if (!show) return null

  return (
    <div
      key={animKey}
      aria-hidden
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden animate-wave-reveal"
    >
      {/* ── Sky gradient: deep navy → harbour blue → light aqua ──────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, #0b1c2c 0%, #16364f 20%, #1e4569 38%, #265989 55%, #3e88c3 72%, #5aa0d7 85%, #a8d2ef 100%)',
        }}
      />

      {/* ── Ice-blue moonlight glow ───────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          width: 220,
          height: 220,
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(213,233,247,0.65) 0%, rgba(90,160,215,0.30) 45%, transparent 68%)',
        }}
      />

      {/* ── Brand mark ───────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none">
        <BrandMark variant="white" className="h-14 md:h-16 opacity-70" />
      </div>

      {/* ── Wave shapes ──────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 leading-[0]">
        <svg
          viewBox="0 0 1440 80"
          className="block w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z"
            fill="rgba(168,210,239,0.45)"
          />
        </svg>
        <svg
          viewBox="0 0 1440 52"
          className="block w-full -mt-4"
          preserveAspectRatio="none"
        >
          <path
            d="M0,26 C300,52 600,0 900,26 C1050,39 1200,13 1440,26 L1440,52 L0,52 Z"
            fill="rgba(213,233,247,0.35)"
          />
        </svg>
      </div>
    </div>
  )
}
