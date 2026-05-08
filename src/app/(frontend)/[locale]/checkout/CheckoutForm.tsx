'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { useCustomerStore } from '@/store/customer'

type Props = { locale: string }

export function CheckoutForm({ locale }: Props) {
  const t = useTranslations('checkout')
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCartStore()
  const { customer } = useCustomerStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [addr, setAddr] = useState({ zip: '', city: '', district: '', address: '' })

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponMsg, setCouponMsg] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponChecking, setCouponChecking] = useState(false)

  const SHIPPING_FEE = 120 // 黑貓冷凍宅配固定運費

  // Points state
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const maxPoints = Math.min(customer?.points ?? 0, totalPrice + SHIPPING_FEE - couponDiscount)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-fill from customer account
  useEffect(() => {
    if (customer) {
      setName(customer.name ?? '')
      setEmail(customer.email ?? '')
      setPhone(customer.phone ?? '')
      const da = (customer.defaultAddress ?? {}) as any
      setAddr({
        zip: da.zip ?? '',
        city: da.city ?? '',
        district: da.district ?? '',
        address: da.address ?? '',
      })
    }
  }, [customer])

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

  const finalTotal = Math.max(1, totalPrice + SHIPPING_FEE - couponDiscount - pointsToRedeem)

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return
    setCouponChecking(true)
    setCouponMsg('')
    setCouponDiscount(0)
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode.trim()}&amount=${totalPrice}`)
      const data = await res.json()
      if (data.valid) {
        setCouponDiscount(data.discountAmount ?? 0)
        const c = data.coupon
        setCouponMsg(`✓ ${c.description ?? '折扣碼有效'} — 折抵 NT$${data.discountAmount}`)
      } else {
        setCouponMsg(`✗ ${data.error ?? '折扣碼無效'}`)
      }
    } catch {
      setCouponMsg('✗ 查詢失敗，請稍後再試')
    } finally {
      setCouponChecking(false)
    }
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
          couponCode: couponDiscount > 0 ? couponCode.trim() : undefined,
          couponDiscount,
          pointsRedeemed: pointsToRedeem,
          customerId: customer?.id,
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

        {/* Coupon */}
        <div className="border-t border-sand-100 pt-3">
          <p className="text-xs text-ink/50 mb-2">折扣碼</p>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(''); setCouponDiscount(0) }}
              placeholder="輸入折扣碼"
              className="flex-1 border border-sand-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-400 bg-paper-50"
            />
            <button
              type="button"
              onClick={handleCouponApply}
              disabled={couponChecking || !couponCode}
              className="bg-sand-100 hover:bg-sand-200 text-ink text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              套用
            </button>
          </div>
          {couponMsg && (
            <p className={`text-xs mt-1.5 ${couponMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {couponMsg}
            </p>
          )}
        </div>

        {/* Points redemption */}
        {customer && (customer.points ?? 0) > 0 && (
          <div className="border-t border-sand-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-ink/50">使用點數折抵（可用：{customer.points} 點）</p>
              <p className="text-xs text-brand-700 font-medium">1點 = NT$1</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={maxPoints}
                step={10}
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                className="flex-1 accent-brand-600"
              />
              <span className="text-sm font-medium text-brand-700 w-20 text-right">
                -{pointsToRedeem > 0 ? `NT$${pointsToRedeem}` : '0'}
              </span>
            </div>
          </div>
        )}

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
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>折扣碼</span>
              <span>-NT${couponDiscount.toLocaleString()}</span>
            </div>
          )}
          {pointsToRedeem > 0 && (
            <div className="flex justify-between text-sm text-brand-600">
              <span>點數折抵</span>
              <span>-NT${pointsToRedeem.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-serif text-base pt-1 border-t border-sand-100">
            <span>實付金額</span>
            <span>NT${finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-ink/50">聯絡資料</h2>
        {customer && (
          <p className="text-xs text-brand-600 bg-brand-50 rounded-lg px-3 py-2">
            ✓ 已自動填入會員資料
          </p>
        )}
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

      {!customer && (
        <p className="text-xs text-ink/50 text-center">
          <a href={`/${locale}/account/login`} className="text-brand-700 underline">登入會員</a> 可使用點數折抵與查看訂單記錄
        </p>
      )}

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
