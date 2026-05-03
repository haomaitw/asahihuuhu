'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { CartDrawer } from './CartDrawer'

export function CartButton() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems)

  // Avoid SSR/hydration mismatch: only show badge after client mount
  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Shopping cart"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {mounted && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sea-500 text-[10px] font-medium text-white">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
