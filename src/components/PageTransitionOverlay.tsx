'use client'
/**
 * PageTransitionOverlay
 *
 * On every client-side navigation (pathname change), this overlay slides
 * down over the screen — a sunset scene (sea 900 → amber → sea 400) with
 * the brand mark centred and two SVG wave shapes at the bottom — then
 * continues upward off the viewport, revealing the new page beneath.
 *
 * Visual metaphor: the Tamsui harbour at golden hour, tide rolling in,
 * lifting the scene to uncover the next destination.
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
      {/* ── Sky gradient: deep harbour → amber sun → sea surface ────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, #0b1c2c 0%, #16364f 18%, #265989 45%, #f59e0b 68%, #fb923c 80%, #5aa0d7 100%)',
        }}
      />

      {/* ── Sun glow ─────────────────────────────────────────────────── */}
      <div
        className="absolute"
        style={{
          width: 180,
          height: 180,
          top: '60%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,237,158,0.85) 0%, rgba(251,191,36,0.45) 42%, transparent 68%)',
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
            fill="rgba(30,69,105,0.65)"
          />
        </svg>
        <svg
          viewBox="0 0 1440 52"
          className="block w-full -mt-4"
          preserveAspectRatio="none"
        >
          <path
            d="M0,26 C300,52 600,0 900,26 C1050,39 1200,13 1440,26 L1440,52 L0,52 Z"
            fill="rgba(11,28,44,0.55)"
          />
        </svg>
      </div>
    </div>
  )
}
