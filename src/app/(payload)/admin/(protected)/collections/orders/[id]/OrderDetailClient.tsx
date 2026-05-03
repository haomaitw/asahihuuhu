'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const STATUS_OPTIONS = [
  { value: 'pending',  label: '待付款' },
  { value: 'paid',     label: '已付款' },
  { value: 'failed',   label: '付款失敗' },
  { value: 'refunded', label: '已退款' },
]

type Props = {
  order: any
  statusLabels: Record<string, { label: string; variant: string }>
}

export function OrderDetailClient({ order, statusLabels }: Props) {
  const router = useRouter()
  const [status, setStatus] = React.useState(order.status ?? 'pending')
  const [note, setNote] = React.useState(order.note ?? '')
  const [loading, setLoading] = React.useState(false)

  const s = statusLabels[order.status ?? ''] ?? { label: order.status ?? '—', variant: 'neutral' }

  const handleSave = async () => {
    setLoading(true)
    try {
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, note }),
      })
      toast.success('訂單已更新')
      router.refresh()
    } catch {
      toast.error('更新失敗')
    } finally {
      setLoading(false)
    }
  }

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex py-3 border-b border-adm-border-subtle last:border-0">
      <dt className="w-32 shrink-0 text-xs text-adm-text-tertiary uppercase tracking-wider font-medium pt-0.5">{label}</dt>
      <dd className="flex-1 text-sm text-adm-text-primary">{value ?? '—'}</dd>
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
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
            {row('目前狀態', <Badge variant={s.variant as any} size="sm">{s.label}</Badge>)}
          </dl>
        </CardContent>
      </Card>

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
            <tfoot>
              <tr className="bg-adm-bg-sunken">
                <td colSpan={3} className="px-5 py-3 text-right text-sm font-semibold text-adm-text-primary">總計</td>
                <td className="px-5 py-3 text-sm font-bold tabular-nums text-adm-brand-700">
                  NT$ {order.totalAmount?.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>

      {/* Status update */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">更新訂單</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label>訂單狀態</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>備註</Label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="內部備註（顧客不可見）"
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
