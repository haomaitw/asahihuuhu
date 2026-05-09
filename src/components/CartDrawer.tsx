'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCartStore } from '@/store/cart'
import { useCustomerStore } from '@/store/customer'
import { useModalStore } from '@/store/modal'

type Props = { open: boolean; onClose: () => void; locale?: string }

type Step = 'cart' | 'checkout' | 'done'

const SHIPPING_FEE = 120

export function CartDrawer({ open, onClose, locale = 'zh-TW' }: Props) {
  const t = useTranslations('cart')
  const tc = useTranslations('checkout')
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore()
  const { customer } = useCustomerStore()

  const [step, setStep] = useState<Step>('cart')
  const [orderNumber, setOrderNumber] = useState('')
  const [orderOk, setOrderOk] = useState(false)

  // Checkout form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [addr, setAddr] = useState({ zip: '', city: '', district: '', address: '' })

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponMsg, setCouponMsg] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponChecking, setCouponChecking] = useState(false)

  // Points
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const maxPoints = Math.min(customer?.points ?? 0, totalPrice + SHIPPING_FEE - couponDiscount)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const finalTotal = Math.max(1, totalPrice + SHIPPING_FEE - couponDiscount - pointsToRedeem)

  // Auto-fill from customer
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

  // Reset step when drawer closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('cart')
        setError('')
        setCouponCode('')
        setCouponMsg('')
        setCouponDiscount(0)
        setPointsToRedeem(0)
      }, 300)
    }
  }, [open])

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
      if (!res.ok) throw new Error(data.error ?? '發生錯誤')

      clearCart()
      setOrderNumber(data.orderNumber ?? data.merchantTradeNo ?? '')
      setOrderOk(true)
      setStep('done')

      // If server returns ECPay redirect form fields, submit them
      if (data.url && data.fields) {
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
      }
    } catch (err: any) {
      setError(err.message ?? tc('error'))
      setOrderOk(false)
      setStep('done')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-ink/30 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-paper-50 shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                onClick={() => setStep('cart')}
                className="p-1 rounded hover:bg-paper-100 text-ink/50 hover:text-ink"
                aria-label="返回購物車"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <h2 className="font-sans font-light text-lg tracking-wide">
              {step === 'cart' ? t('title') : step === 'checkout' ? '結帳資訊' : '訂單確認'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-paper-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── STEP 1: CART ── */}
        {step === 'cart' && (
          <>
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
              <div className="px-6 py-5 border-t border-stone-200 space-y-3 shrink-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="tracking-wide text-ink/60">{t('subtotal')}</span>
                  <span className="font-medium">NT$ {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-ink/40">
                  <span>運費（黑貓冷凍宅配）</span>
                  <span>NT$ {SHIPPING_FEE}</span>
                </div>
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full btn-primary py-3 text-sm tracking-widest"
                >
                  {t('checkout')}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── STEP 2: CHECKOUT ── */}
        {step === 'checkout' && (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

              {/* Guest/member banner */}
              {!customer && (
                <div className="flex items-center justify-between bg-sea-50 border border-sea-200 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-sans text-ink/80">以訪客身份結帳</p>
                    <p className="text-xs text-ink/45 mt-0.5">訂單完成後可憑 Email 查詢</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => useModalStore.getState().openLogin()}
                    className="text-xs text-sea-500 hover:text-sea-400 font-sans underline-offset-2 hover:underline shrink-0 ml-3"
                  >
                    會員登入
                  </button>
                </div>
              )}

              {/* Contact info */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-ink/40">聯絡資料</h3>
                {customer && (
                  <p className="text-xs text-sea-600 bg-sea-50 rounded-lg px-3 py-2">已自動填入會員資料</p>
                )}
                <div>
                  <label className="block text-xs text-ink/50 mb-1">{tc('name')} *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sea-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink/50 mb-1">{tc('email')} *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sea-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-ink/50 mb-1">{tc('phone')} *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sea-400 bg-white"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-ink/40">收件地址</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-ink/50 mb-1">郵遞區號</label>
                    <input
                      value={addr.zip}
                      onChange={(e) => setAddr(p => ({ ...p, zip: e.target.value }))}
                      maxLength={5}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sea-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink/50 mb-1">縣市</label>
                    <input
                      value={addr.city}
                      onChange={(e) => setAddr(p => ({ ...p, city: e.target.value }))}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sea-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ink/50 mb-1">區</label>
                    <input
                      value={addr.district}
                      onChange={(e) => setAddr(p => ({ ...p, district: e.target.value }))}
                      className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sea-400 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-ink/50 mb-1">詳細地址</label>
                  <input
                    value={addr.address}
                    onChange={(e) => setAddr(p => ({ ...p, address: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sea-400 bg-white"
                  />
                </div>
              </div>

              {/* Coupon */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-widest text-ink/40">折扣碼</h3>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(''); setCouponDiscount(0) }}
                    placeholder="輸入折扣碼"
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-sea-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleCouponApply}
                    disabled={couponChecking || !couponCode}
                    className="bg-paper-100 hover:bg-paper-200 text-ink text-sm px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    套用
                  </button>
                </div>
                {couponMsg && (
                  <p className={`text-xs ${couponMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                    {couponMsg}
                  </p>
                )}
              </div>

              {/* Points */}
              {customer && (customer.points ?? 0) > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs uppercase tracking-widest text-ink/40">點數折抵</h3>
                    <span className="text-xs text-ink/50">可用：{customer.points} 點</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={maxPoints}
                      step={10}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="flex-1 accent-sea-500"
                    />
                    <span className="text-sm font-medium text-sea-600 w-16 text-right shrink-0">
                      {pointsToRedeem > 0 ? `-NT$${pointsToRedeem}` : '0'}
                    </span>
                  </div>
                </div>
              )}

              {/* Order summary */}
              <div className="bg-white border border-stone-100 rounded-xl p-4 space-y-2">
                <h3 className="text-xs uppercase tracking-widest text-ink/40 mb-3">訂單明細</h3>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-ink/70 truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
                    <span className="shrink-0">NT${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-stone-100 pt-2 space-y-1">
                  <div className="flex justify-between text-xs text-ink/50">
                    <span>運費（黑貓冷凍宅配）</span>
                    <span>NT${SHIPPING_FEE}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>折扣碼</span>
                      <span>-NT${couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {pointsToRedeem > 0 && (
                    <div className="flex justify-between text-xs text-sea-600">
                      <span>點數折抵</span>
                      <span>-NT${pointsToRedeem.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium text-sm pt-1 border-t border-stone-100">
                    <span>實付金額</span>
                    <span>NT${finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}
            </div>

            {/* Submit */}
            <div className="px-6 py-5 border-t border-stone-200 shrink-0">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-sm tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    處理中…
                  </>
                ) : `付款 NT$${finalTotal.toLocaleString()}`}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: DONE ── */}
        {step === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-6">
            {orderOk ? (
              <>
                <div className="w-16 h-16 rounded-full bg-sea-100 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sea-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-sans font-light text-xl tracking-wide text-ink mb-2">{tc('success')}</p>
                  <p className="text-sm text-ink/60">{tc('successMessage')}</p>
                  {orderNumber && (
                    <p className="text-xs text-ink/40 mt-3">
                      {tc('orderNumber')}：<span className="font-mono text-ink/60">{orderNumber}</span>
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <div>
                  <p className="font-sans font-light text-xl tracking-wide text-ink mb-2">{tc('failed')}</p>
                  <p className="text-sm text-ink/60">{error || tc('failedMessage')}</p>
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="btn-primary px-8 py-3 text-sm tracking-widest"
            >
              關閉
            </button>
          </div>
        )}
      </div>
    </>
  )
}
