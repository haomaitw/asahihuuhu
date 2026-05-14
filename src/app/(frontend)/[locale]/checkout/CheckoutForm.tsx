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
  const [addr, setAddr] = useState({ zip: '', city: '', district: '', address: '' })
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const SHIPPING_FEE = 120
  const finalTotal = Math.max(1, totalPrice + SHIPPING_FEE)

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
        credentials: 'include',
        body: JSON.stringify({
          items,
          locale,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          shippingAddress: addr,
          note: note.trim() || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <h1 className="font-serif text-3xl tracking-wide">{t('title')}</h1>

      {/* Order Summary */}
      <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-ink/50 mb-4">訂單明細</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-ink/40">× {item.quantity}</p>
              </div>
              <p className="text-sm shrink-0 font-medium">NT${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Total breakdown */}
        <div className="border-t border-sand-100 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-ink/60">
            <span>小計</span>
            <span>NT${totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-ink/60">
            <span className="flex items-center gap-1">
              運費
              <span className="text-[10px] text-ink/40">（黑貓冷凍宅配）</span>
            </span>
            <span>NT${SHIPPING_FEE.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-serif text-base pt-1 border-t border-sand-100">
            <span>實付金額</span>
            <span>NT${finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-ink/50">聯絡資料</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-ink/50 mb-1.5">{t('name')} *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/50 mb-1.5">{t('phone')} *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1.5">{t('email')} *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-ink/50">收件地址</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-ink/50 mb-1.5">郵遞區號</label>
            <input
              value={addr.zip}
              onChange={(e) => setAddr(p => ({ ...p, zip: e.target.value }))}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/50 mb-1.5">縣市</label>
            <input
              value={addr.city}
              onChange={(e) => setAddr(p => ({ ...p, city: e.target.value }))}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/50 mb-1.5">區</label>
            <input
              value={addr.district}
              onChange={(e) => setAddr(p => ({ ...p, district: e.target.value }))}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-ink/50 mb-1.5">詳細地址</label>
          <input
            value={addr.address}
            onChange={(e) => setAddr(p => ({ ...p, address: e.target.value }))}
            className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
          />
        </div>
      </div>

      {/* Gift / Order Note */}
      <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-xs uppercase tracking-widest text-ink/50">禮品留言 / 備註</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={200}
          placeholder="如有禮品包裝需求、特殊說明或訂單備註，請在此輸入（選填）"
          className="w-full resize-none border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50 text-ink placeholder:text-ink/30"
        />
        {note.length > 0 && (
          <p className="text-xs text-ink/30 text-right">{note.length}/200</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-4 text-sm tracking-widest disabled:opacity-60 rounded-xl"
      >
        {loading ? t('processing') : `前往付款 NT$${finalTotal.toLocaleString()}`}
      </button>
    </form>
  )
}
