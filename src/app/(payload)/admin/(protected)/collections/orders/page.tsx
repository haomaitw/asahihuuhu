import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { getAdminPayload, STATUS_LABELS } from '@/app/(payload)/admin/_lib/payload'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '訂單管理' }
export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const payload = await getAdminPayload()
  const { docs, totalDocs } = await payload.find({
    collection: 'orders',
    limit: 100,
    sort: '-createdAt',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-adm-text-primary">訂單管理</h1>
        <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 筆訂單</p>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="尚無訂單" description="顧客完成結帳後訂單將在此顯示" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['訂單號', '顧客', '電話', '狀態', '金額', '日期', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((o: any) => {
                  const s = STATUS_LABELS[o.status ?? ''] ?? { label: o.status ?? '—', variant: 'neutral' }
                  return (
                    <tr key={o.id} className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-adm-text-primary font-mono">
                        {o.orderNumber ?? `#${o.id}`}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-adm-text-secondary">{o.customerName ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-adm-text-secondary">{o.customerPhone ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={s.variant as any} size="sm">{s.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-primary">
                        {o.totalAmount ? `NT$ ${o.totalAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-adm-text-tertiary whitespace-nowrap">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('zh-TW') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/collections/orders/${o.id}`} className="text-xs text-adm-brand-600 hover:underline">
                          檢視
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
