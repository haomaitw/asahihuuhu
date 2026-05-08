'use client'

import { useRef, useEffect, useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  /** Extra delay in ms (stagger children) */
  delay?: number
  /** Amount of element to be visible before triggering (0–1) */
  threshold?: number
}

/**
 * Wraps children in a div that fades + slides up when scrolled into view.
 * One-shot: once visible it stays visible.
 */
export function AnimateIn({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: visible
          ? `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`
          : 'none',
      }}
    >
      {children}
    </div>
  )
}
