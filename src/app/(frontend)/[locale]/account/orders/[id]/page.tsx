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
  subtotal?: number
  shippingFee?: number
  totalAmount: number
  pointsEarned: number
  trackingNumber?: string
  shippingCarrier?: string
  createdAt: string
  items: { productName: string; quantity: number; unitPrice: number; variant?: string }[]
  shippingAddress?: {
    recipient?: string
    phone?: string
    zip?: string
    city?: string
    district?: string
    address?: string
  }
  notes?: string
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  failed: '付款失敗',
  refunded: '已退款',
}
const FULFILLMENT_LABEL: Record<string, string> = {
  unfulfilled: '待出貨',
  processing: '備貨中',
  shipped: '已出貨',
  delivered: '已送達',
  cancelled: '已取消',
}
const FULFILLMENT_COLOR: Record<string, string> = {
  unfulfilled: 'text-yellow-600 bg-yellow-50',
  processing: 'text-blue-600 bg-blue-50',
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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const router = useRouter()
  const { customer, fetchMe } = useCustomerStore()
  const [locale, setLocale] = useState('zh-TW')
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    params
      .then((p) => {
        setLocale(p.locale)
        setOrderId(p.id)
      })
      .catch(() => {})
    fetchMe()
  }, [fetchMe, params])

  useEffect(() => {
    if (customer === null) router.push(`/${locale}/account/login`)
    if (!customer || !orderId) return
    fetch(`/api/orders/${orderId}`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error('not found')
        return r.json()
      })
      .then((d) => setOrder(d))
      .catch(() => setError('無法載入訂單，請稍後再試'))
      .finally(() => setLoading(false))
  }, [customer, locale, orderId, router])

  const canReturn =
    order?.fulfillmentStatus === 'delivered' || order?.fulfillmentStatus === 'shipped'

  return (
    <main className="min-h-dvh bg-paper-50 py-24 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/${locale}/account/orders`}
            className="text-ink/40 hover:text-ink text-sm"
          >
            ← 我的訂單
          </Link>
          <h1 className="font-serif text-2xl text-ink">訂單詳情</h1>
        </div>

        {loading && <p className="text-center text-ink/40 py-12">載入中…</p>}

        {error && (
          <div className="text-center py-16">
            <p className="text-ink/50">{error}</p>
          </div>
        )}

        {order && (
          <div className="space-y-4">
            {/* Order header card */}
            <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-xs text-ink/40">
                    {new Date(order.createdAt).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="font-mono text-base text-ink mt-1">{order.orderNumber}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${FULFILLMENT_COLOR[order.fulfillmentStatus] ?? 'text-ink/60 bg-sand-50'}`}
                >
                  {FULFILLMENT_LABEL[order.fulfillmentStatus] ?? order.fulfillmentStatus}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-xs text-ink/50 bg-sand-50 px-2 py-0.5 rounded-full">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
            </div>

            {/* Items card */}
            <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
              <h2 className="font-serif text-sm text-ink/60 mb-3 tracking-wide">訂購商品</h2>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm text-ink font-sans font-light truncate">
                        {item.productName}
                      </p>
                      {item.variant && (
                        <p className="text-xs text-ink/40 mt-0.5">{item.variant}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-ink/50">× {item.quantity}</p>
                      <p className="text-sm text-ink">
                        NT${(item.unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 pt-4 border-t border-sand-100 space-y-1.5">
                {order.subtotal !== undefined && (
                  <div className="flex justify-between text-sm text-ink/60">
                    <span>小計</span>
                    <span>NT${order.subtotal.toLocaleString()}</span>
                  </div>
                )}
                {order.shippingFee !== undefined && (
                  <div className="flex justify-between text-sm text-ink/60">
                    <span>運費</span>
                    <span>{order.shippingFee === 0 ? '免運' : `NT${order.shippingFee.toLocaleString()}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-serif text-ink pt-1">
                  <span>合計</span>
                  <span>NT${order.totalAmount.toLocaleString()}</span>
                </div>
                {order.pointsEarned > 0 && (
                  <p className="text-xs text-sea-400 text-right">+ {order.pointsEarned} 點回饋</p>
                )}
              </div>
            </div>

            {/* Shipping card */}
            {(order.shippingAddress || order.trackingNumber) && (
              <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
                <h2 className="font-serif text-sm text-ink/60 mb-3 tracking-wide">配送資訊</h2>

                {order.shippingAddress && (
                  <div className="text-sm text-ink/70 space-y-0.5 mb-3 font-sans font-light">
                    {order.shippingAddress.recipient && (
                      <p>
                        收件人：<span className="text-ink">{order.shippingAddress.recipient}</span>
                        {order.shippingAddress.phone && (
                          <span className="ml-2 text-ink/50">{order.shippingAddress.phone}</span>
                        )}
                      </p>
                    )}
                    {(order.shippingAddress.city || order.shippingAddress.address) && (
                      <p>
                        地址：
                        <span className="text-ink">
                          {[
                            order.shippingAddress.zip,
                            order.shippingAddress.city,
                            order.shippingAddress.district,
                            order.shippingAddress.address,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="bg-sand-50 rounded-lg px-3 py-2 text-xs text-ink/60">
                    物流：
                    <span className="text-ink">
                      {CARRIER_LABEL[order.shippingCarrier ?? ''] ?? order.shippingCarrier}
                    </span>
                    <span className="mx-1.5">·</span>
                    追蹤號：
                    <span className="font-mono text-ink">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
                <h2 className="font-serif text-sm text-ink/60 mb-2 tracking-wide">備註</h2>
                <p className="text-sm text-ink/70 font-sans font-light">{order.notes}</p>
              </div>
            )}

            {/* Return button */}
            {canReturn && (
              <div className="pt-2">
                <Link
                  href={`/${locale}/account/orders/${order.id}/return`}
                  className="block w-full text-center border border-sand-200 rounded-2xl py-3 text-sm text-ink/60 hover:border-sea-400 hover:text-sea-400 transition-colors font-sans font-light"
                >
                  申請退換貨
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
