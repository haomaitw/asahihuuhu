'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'

type Props = { locale: string }

export function CheckoutForm({ locale }: Props) {
  const t = useTranslations('checkout')
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="text-center py-24 space-y-6">
        <p className="text-ink/50 tracking-wide">{t('emptyCart')}</p>
        <button
          onClick={() => router.push(`/${locale}/shop`)}
          className="btn-primary px-8 py-3 text-sm tracking-widest"
        >
          {t('backToShop')}
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ecpay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          locale,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')

      clearCart()

      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.url
      Object.entries(data.fields as Record<string, string>).forEach(([k, v]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = k
        input.value = v
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } catch (err: any) {
      setError(err.message ?? t('error'))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl tracking-wide mb-8">{t('title')}</h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded overflow-hidden bg-stone-100 shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-ink/50">
                  {t('quantity')}: {item.quantity}
                </p>
              </div>
              <p className="text-sm shrink-0">NT$ {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center py-4 border-t border-b border-stone-200 mb-8">
          <span className="text-sm tracking-wide">{t('total')}</span>
          <span className="font-medium text-lg">NT$ {totalPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-sm uppercase tracking-widest text-ink/50">{t('customerInfo')}</h2>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/50 mb-1.5">
            {t('name')} *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sea-400 focus:ring-1 focus:ring-sea-400"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/50 mb-1.5">
            {t('email')} *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sea-400 focus:ring-1 focus:ring-sea-400"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink/50 mb-1.5">
            {t('phone')} *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sea-400 focus:ring-1 focus:ring-sea-400"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3.5 text-sm tracking-widest disabled:opacity-60"
      >
        {loading ? t('processing') : t('pay')}
      </button>
    </form>
  )
}
