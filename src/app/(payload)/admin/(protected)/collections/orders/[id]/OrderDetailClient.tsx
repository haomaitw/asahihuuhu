'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Truck } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending_payment', label: '待付款' },
  { value: 'paid',            label: '已付款' },
  { value: 'failed',          label: '付款失敗' },
  { value: 'refunded',        label: '已退款' },
]

const FULFILLMENT_STATUS_OPTIONS = [
  { value: 'unfulfilled', label: '未出貨' },
  { value: 'processing',  label: '備貨中' },
  { value: 'shipped',     label: '已出貨' },
  { value: 'delivered',   label: '已送達' },
  { value: 'cancelled',   label: '已取消' },
]

const FULFILLMENT_BADGES: Record<string, { label: string; variant: 'neutral' | 'info' | 'success' | 'danger' }> = {
  unfulfilled: { label: '未出貨', variant: 'neutral' },
  processing:  { label: '備貨中', variant: 'info' },
  shipped:     { label: '已出貨', variant: 'success' },
  delivered:   { label: '已送達', variant: 'success' },
  cancelled:   { label: '已取消', variant: 'danger' },
}

type Props = {
  order: any
  statusLabels: Record<string, { label: string; variant: string }>
}

export function OrderDetailClient({ order, statusLabels }: Props) {
  const router = useRouter()

  const [status, setStatus] = React.useState(order.status ?? 'pending_payment')
  const [fulfillmentStatus, setFulfillmentStatus] = React.useState(order.fulfillmentStatus ?? 'unfulfilled')
  const [trackingNumber, setTrackingNumber] = React.useState(order.trackingNumber ?? '')
  const [note, setNote] = React.useState(order.adminNote ?? order.note ?? '')
  const [loading, setLoading] = React.useState(false)

  const [tcatLoading, setTcatLoading] = React.useState(false)
  const [tcatOrderNo, setTcatOrderNo] = React.useState<string>(order.tcatOrderNo ?? '')

  const paymentBadge = statusLabels[order.status ?? ''] ?? { label: order.status ?? '—', variant: 'neutral' }
  const fulfillmentBadge = FULFILLMENT_BADGES[order.fulfillmentStatus ?? ''] ?? { label: order.fulfillmentStatus ?? '—', variant: 'neutral' }

  const showBlackCatCard =
    order.status === 'paid' &&
    order.fulfillmentStatus !== 'shipped' &&
    order.fulfillmentStatus !== 'delivered'

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status,
          fulfillmentStatus,
          trackingNumber,
          adminNote: note,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('訂單已更新')
      router.refresh()
    } catch {
      toast.error('更新失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBlackCat = async () => {
    setTcatLoading(true)
    try {
      const res = await fetch('/api/ecpay/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId: order.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? '建立黑貓出貨單失敗')
        return
      }
      setTcatOrderNo(data.tcatOrderNo ?? '')
      setFulfillmentStatus('processing')
      toast.success(`黑貓出貨單已建立：${data.tcatOrderNo}`)
      router.refresh()
    } catch {
      toast.error('建立黑貓出貨單失敗，請稍後再試')
    } finally {
      setTcatLoading(false)
    }
  }

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex py-3 border-b border-adm-border-subtle last:border-0">
      <dt className="w-36 shrink-0 text-xs text-adm-text-tertiary uppercase tracking-wider font-medium pt-0.5">{label}</dt>
      <dd className="flex-1 text-sm text-adm-text-primary">{value ?? '—'}</dd>
    </div>
  )

  // Calculate totals
  const subtotal = order.subtotal ?? (order.items ?? []).reduce((s: number, i: any) => s + (i.unitPrice ?? 0) * (i.quantity ?? 0), 0)
  const shippingFee = order.shippingFee ?? 0
  const couponDiscount = order.couponDiscount ?? 0
  const pointsRedeemed = order.pointsRedeemed ?? 0
  const totalAmount = order.totalAmount ?? 0

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/collections/orders" className="inline-flex items-center gap-1 text-xs text-adm-text-tertiary hover:text-adm-text-primary mb-2">
            <ArrowLeft className="h-3 w-3" /> 訂單列表
          </Link>
          <h1 className="text-2xl font-semibold text-adm-text-primary font-mono">
            {order.orderNumber ?? `#${order.id}`}
          </h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </p>
        </div>
        <Button variant="primary" size="md" loading={loading} onClick={handleSave}>
          儲存變更
        </Button>
      </div>

      {/* Customer info */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">顧客資料</h2>
        </div>
        <CardContent className="p-5">
          <dl>
            {row('姓名', order.customerName)}
            {row('Email', order.customerEmail)}
            {row('電話', order.customerPhone)}
            {row('ECPay No.', <span className="font-mono text-adm-text-secondary">{order.ecpayTradeNo}</span>)}
            {row('付款狀態', <Badge variant={paymentBadge.variant as any} size="sm">{paymentBadge.label}</Badge>)}
            {row('出貨狀態', <Badge variant={fulfillmentBadge.variant as any} size="sm">{fulfillmentBadge.label}</Badge>)}
            {tcatOrderNo && row('黑貓訂單號', <span className="font-mono text-adm-text-secondary">{tcatOrderNo}</span>)}
            {order.trackingNumber && row('物流追蹤號', <span className="font-mono text-adm-text-secondary">{order.trackingNumber}</span>)}
          </dl>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <Card>
          <div className="px-5 py-4 border-b border-adm-border-subtle">
            <h2 className="text-sm font-semibold text-adm-text-primary">收件地址</h2>
          </div>
          <CardContent className="p-5">
            <dl>
              {row('郵遞區號', order.shippingAddress.zip)}
              {row('縣市', order.shippingAddress.city)}
              {row('鄉鎮市區', order.shippingAddress.district)}
              {row('詳細地址', order.shippingAddress.address)}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">訂購商品</h2>
        </div>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                {['商品', '數量', '單價', '小計'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(order.items ?? []).map((item: any, i: number) => (
                <tr key={i} className="border-b border-adm-border-subtle last:border-0">
                  <td className="px-5 py-3 text-sm text-adm-text-primary">{item.productName}</td>
                  <td className="px-5 py-3 text-sm text-adm-text-secondary tabular-nums">{item.quantity}</td>
                  <td className="px-5 py-3 text-sm tabular-nums text-adm-text-secondary">NT$ {item.unitPrice?.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm tabular-nums font-medium text-adm-text-primary">
                    NT$ {((item.unitPrice ?? 0) * (item.quantity ?? 0)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-adm-bg-sunken">
              <tr className="border-t border-adm-border-subtle">
                <td colSpan={3} className="px-5 py-2 text-right text-xs text-adm-text-tertiary">商品小計</td>
                <td className="px-5 py-2 text-sm tabular-nums text-adm-text-secondary">NT$ {subtotal.toLocaleString()}</td>
              </tr>
              {shippingFee > 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-2 text-right text-xs text-adm-text-tertiary">運費</td>
                  <td className="px-5 py-2 text-sm tabular-nums text-adm-text-secondary">NT$ {shippingFee.toLocaleString()}</td>
                </tr>
              )}
              {couponDiscount > 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-2 text-right text-xs text-adm-text-tertiary">
                    折扣碼{order.couponCode ? ` (${order.couponCode})` : ''}
                  </td>
                  <td className="px-5 py-2 text-sm tabular-nums text-adm-success-600">− NT$ {couponDiscount.toLocaleString()}</td>
                </tr>
              )}
              {pointsRedeemed > 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-2 text-right text-xs text-adm-text-tertiary">點數折抵</td>
                  <td className="px-5 py-2 text-sm tabular-nums text-adm-success-600">− NT$ {pointsRedeemed.toLocaleString()}</td>
                </tr>
              )}
              <tr className="border-t border-adm-border-subtle">
                <td colSpan={3} className="px-5 py-3 text-right text-sm font-semibold text-adm-text-primary">實付金額</td>
                <td className="px-5 py-3 text-sm font-bold tabular-nums text-adm-brand-700">
                  NT$ {totalAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Black Cat Shipment */}
      {showBlackCatCard && (
        <Card>
          <div className="px-5 py-4 border-b border-adm-border-subtle">
            <h2 className="text-sm font-semibold text-adm-text-primary flex items-center gap-2">
              <Truck className="h-4 w-4 text-adm-text-tertiary" />
              黑貓宅急便出貨
            </h2>
          </div>
          <CardContent className="p-5">
            {tcatOrderNo ? (
              <div className="space-y-2">
                <p className="text-sm text-adm-text-secondary">已建立黑貓出貨單</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-adm-text-tertiary">黑貓訂單編號</span>
                  <span className="font-mono text-sm font-medium text-adm-text-primary">{tcatOrderNo}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-adm-text-secondary">
                  訂單已付款，可建立黑貓宅急便出貨單。建立後系統將自動更新出貨狀態為備貨中。
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  loading={tcatLoading}
                  onClick={handleCreateBlackCat}
                >
                  <Truck className="h-4 w-4 mr-1.5" />
                  建立黑貓出貨單
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status & Fulfillment Update */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">更新訂單</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>付款狀態</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
              >
                {PAYMENT_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>出貨狀態</Label>
              <select
                value={fulfillmentStatus}
                onChange={(e) => setFulfillmentStatus(e.target.value)}
                className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
              >
                {FULFILLMENT_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>物流追蹤號碼</Label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="輸入物流追蹤號碼"
              className="h-9 w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
            />
          </div>
          <div className="space-y-1.5">
            <Label>內部備註</Label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="內部備註（顧客不可見）"
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none"
            />
          </div>
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>
            儲存變更
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
