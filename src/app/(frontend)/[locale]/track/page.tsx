'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderResult = {
  orderNumber: string
  status: string
  fulfillmentStatus: string
  trackingNumber: string | null
  tcatOrderNo: string | null
  createdAt: string
  shippingCity: string | null
  shippingDistrict: string | null
  items: { productName: string; quantity: number; unitPrice: number }[]
}

// ── Status display maps ────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending_payment: '等待付款',
  paid:            '付款成功',
  failed:          '付款失敗',
  refunded:        '已退款',
}

const FULFILLMENT_STEPS = [
  { key: 'unfulfilled', label: '訂單確認' },
  { key: 'processing',  label: '備貨中' },
  { key: 'shipped',     label: '已出貨' },
  { key: 'delivered',   label: '已送達' },
]

const FULFILLMENT_ORDER = ['unfulfilled', 'processing', 'shipped', 'delivered']

function stepIndex(status: string) {
  const idx = FULFILLMENT_ORDER.indexOf(status)
  return idx === -1 ? 0 : idx
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending_payment: 'bg-amber-100 text-amber-700',
    paid:            'bg-emerald-100 text-emerald-700',
    failed:          'bg-red-100 text-red-700',
    refunded:        'bg-gray-100 text-gray-500',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function FulfillmentTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        訂單已取消
      </div>
    )
  }

  const current = stepIndex(status)

  return (
    <ol className="flex flex-col gap-4">
      {FULFILLMENT_STEPS.map((step, i) => {
        const done    = i <= current
        const active  = i === current
        return (
          <li key={step.key} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold transition-colors ${
              done
                ? 'bg-sea-500 text-white'
                : 'bg-paper-200 text-ink/30'
            }`}>
              {done ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${active ? 'font-medium text-ink' : done ? 'text-ink/70' : 'text-ink/30'}`}>
              {step.label}
              {active && <span className="ml-2 text-sea-500 text-xs">（目前狀態）</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function OrderCard({ order }: { order: OrderResult }) {
  const totalQty   = order.items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-paper-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-paper-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-ink/40 uppercase mb-1">訂單編號</p>
          <p className="font-mono text-base font-medium text-ink">{order.orderNumber}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-paper-100">
        {/* Left: fulfillment timeline */}
        <div className="px-6 py-5">
          <p className="text-xs tracking-[0.2em] text-ink/40 uppercase mb-4">出貨進度</p>
          <FulfillmentTimeline status={order.fulfillmentStatus} />

          {order.fulfillmentStatus === 'shipped' && (
            <div className="mt-5 p-3 bg-sea-50 rounded-xl text-sm">
              {order.trackingNumber && (
                <p className="text-ink/70 mb-1">
                  追蹤號碼：
                  <span className="font-mono font-medium text-ink">{order.trackingNumber}</span>
                </p>
              )}
              <a
                href={`https://www.t-cat.com.tw/Inquire/Trace.aspx${order.trackingNumber ? `?BillID=${order.trackingNumber}` : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sea-600 hover:text-sea-700 font-medium text-xs tracking-wide"
              >
                黑貓宅急便查詢 →
              </a>
            </div>
          )}

          {(order.shippingCity || order.shippingDistrict) && (
            <p className="mt-4 text-xs text-ink/40">
              配送地區：{order.shippingCity}{order.shippingDistrict}
            </p>
          )}
        </div>

        {/* Right: order items */}
        <div className="px-6 py-5">
          <p className="text-xs tracking-[0.2em] text-ink/40 uppercase mb-4">訂購商品</p>
          <ul className="space-y-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-ink/70">{item.productName} × {item.quantity}</span>
                <span className="text-ink font-medium">NT$ {(item.unitPrice * item.quantity).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-paper-100 flex justify-between text-sm font-medium">
            <span className="text-ink/50">共 {totalQty} 件</span>
            <span className="text-ink">小計 NT$ {totalPrice.toLocaleString()}</span>
          </div>
          <p className="mt-3 text-[11px] text-ink/30">
            下單時間：{new Date(order.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function TrackPage() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') ?? '')
  const [email,       setEmail]       = useState(searchParams.get('email') ?? '')
  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState<OrderResult | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  // Auto-query when pre-filled from email link
  useEffect(() => {
    if (searchParams.get('order') && searchParams.get('email')) {
      handleSearch()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(e?: FormEvent) {
    e?.preventDefault()
    if (!orderNumber.trim() || !email.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(
        `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`
      )
      if (res.status === 404) {
        setError('找不到符合的訂單，請確認訂單編號和電子郵件是否正確。')
        return
      }
      if (!res.ok) throw new Error('Server error')
      setResult(await res.json())
    } catch {
      setError('查詢時發生錯誤，請稍後再試。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-paper-50 pt-28 pb-20">
      <div className="container-content max-w-2xl">

        {/* Page header */}
        <div className="text-center mb-10">
          <p className="font-sans font-light text-xs tracking-[0.3em] uppercase text-sea-400 mb-3">
            ORDER TRACKING
          </p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-wide text-ink">訂單查詢</h1>
          <p className="mt-3 text-sm text-ink/50 font-light">
            輸入訂單編號與結帳時使用的電子郵件，即可查詢出貨狀態。
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-3xl shadow-sm border border-paper-100 p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs tracking-[0.15em] text-ink/50 uppercase mb-1.5">
                訂單編號
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="如：ORD-20240101-0001"
                className="w-full rounded-xl border border-paper-200 bg-paper-50 px-4 py-2.5 text-sm text-ink placeholder-ink/25 focus:border-sea-300 focus:outline-none focus:ring-2 focus:ring-sea-100 transition-colors font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] text-ink/50 uppercase mb-1.5">
                電子郵件
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="結帳時填寫的 Email"
                className="w-full rounded-xl border border-paper-200 bg-paper-50 px-4 py-2.5 text-sm text-ink placeholder-ink/25 focus:border-sea-300 focus:outline-none focus:ring-2 focus:ring-sea-100 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm tracking-[0.2em] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '查詢中...' : '查詢訂單'}
            </button>
          </div>
        </form>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center text-sm text-red-600 mb-6">
            {error}
          </div>
        )}

        {/* Result */}
        {result && <OrderCard order={result} />}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/shop" className="text-sm text-ink/40 hover:text-sea-500 transition-colors tracking-wide">
            ← 返回商城
          </Link>
        </div>

      </div>
    </main>
  )
}
