'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart'

type Props = { open: boolean; onClose: () => void }

export function CartDrawer({ open, onClose }: Props) {
  const t = useTranslations('cart')
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-paper-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
          <h2 className="font-serif text-lg tracking-wide">{t('title')}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-paper-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 ? (
            <p className="text-center text-sm text-ink/50 mt-12">{t('empty')}</p>
          ) : items.map((item) => (
            <div key={item.id} className="flex gap-4 items-start">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100">
                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-sea-600 mt-0.5">NT$ {item.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded border border-stone-300 flex items-center justify-center text-sm hover:bg-paper-100"
                  >−</button>
                  <span className="text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded border border-stone-300 flex items-center justify-center text-sm hover:bg-paper-100"
                  >+</button>
                </div>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-ink/30 hover:text-ink/70 mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-stone-200 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="tracking-wide text-ink/60">{t('subtotal')}</span>
              <span className="font-medium">NT$ {totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full btn-primary py-3 text-sm tracking-widest"
            >
              {t('checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
