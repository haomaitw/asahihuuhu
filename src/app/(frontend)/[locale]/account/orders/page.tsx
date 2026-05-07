'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomerStore } from '@/store/customer'

type Order = {
  id: string
  orderNumber: string
  status: string
  fulfillmentStatus: string
  totalAmount: number
  pointsEarned: number
  trackingNumber?: string
  shippingCarrier?: string
  createdAt: string
  items: { productName: string; quantity: number; unitPrice: number }[]
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  failed: '付款失敗',
  refunded: '已退款',
}
const FULFILLMENT_LABEL: Record<string, string> = {
  pending: '待處理',
  preparing: '備貨中',
  shipped: '已出貨',
  delivered: '已送達',
  cancelled: '已取消',
}
const FULFILLMENT_COLOR: Record<string, string> = {
  pending: 'text-sand-600 bg-sand-50',
  preparing: 'text-blue-600 bg-blue-50',
  shipped: 'text-amber-600 bg-amber-50',
  delivered: 'text-green-600 bg-green-50',
  cancelled: 'text-red-500 bg-red-50',
}
const CARRIER_LABEL: Record<string, string> = {
  tcat: '黑貓宅急便',
  '711': '7-11 超商取貨',
  family: '全家超商取貨',
  post: '郵局',
}

export default function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const { customer, fetchMe } = useCustomerStore()
  const [locale, setLocale] = useState('zh-TW')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then((p) => setLocale(p.locale)).catch(() => {})
    fetchMe()
  }, [fetchMe, params])

  useEffect(() => {
    if (customer === null) router.push(`/${locale}/account/login`)
    if (!customer) return
    fetch('/api/orders?sort=-createdAt&limit=20', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setOrders(d.docs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [customer, locale, router])

  return (
    <main className="min-h-dvh bg-paper-50 py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${locale}/account`} className="text-ink/40 hover:text-ink text-sm">← 會員中心</Link>
          <h1 className="font-serif text-2xl text-ink">我的訂單</h1>
        </div>

        {loading && <p className="text-center text-ink/40 py-12">載入中…</p>}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🍧</p>
            <p className="text-ink/50 mb-6">還沒有訂單記錄</p>
            <Link
              href={`/${locale}/shop`}
              className="inline-block bg-brand-700 text-white text-sm px-6 py-3 rounded-xl font-serif tracking-widest hover:bg-brand-800 transition-colors"
            >
              立即選購
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-ink/40">{new Date(order.createdAt).toLocaleDateString('zh-TW')}</p>
                  <p className="font-mono text-sm text-ink mt-0.5">{order.orderNumber}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${FULFILLMENT_COLOR[order.fulfillmentStatus] ?? 'text-ink/60 bg-sand-50'}`}>
                  {FULFILLMENT_LABEL[order.fulfillmentStatus] ?? order.fulfillmentStatus}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1 mb-3">
                {order.items?.slice(0, 3).map((item, i) => (
                  <p key={i} className="text-sm text-ink/70">
                    {item.productName} × {item.quantity}
                    <span className="text-ink/40 ml-2">NT${(item.unitPrice * item.quantity).toLocaleString()}</span>
                  </p>
                ))}
                {(order.items?.length ?? 0) > 3 && (
                  <p className="text-xs text-ink/40">⋯ 等 {order.items.length} 項商品</p>
                )}
              </div>

              {/* Tracking */}
              {order.trackingNumber && (
                <div className="bg-sand-50 rounded-lg px-3 py-2 text-xs text-ink/60 mb-3">
                  📦 {CARRIER_LABEL[order.shippingCarrier ?? ''] ?? order.shippingCarrier} ·
                  追蹤號：<span className="font-mono text-ink">{order.trackingNumber}</span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-sand-100">
                <div className="text-xs text-ink/40">
                  {STATUS_LABEL[order.status]}
                  {order.pointsEarned > 0 && (
                    <span className="ml-2 text-brand-600">+ {order.pointsEarned} 點</span>
                  )}
                </div>
                <p className="font-serif text-base text-ink">NT${order.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
