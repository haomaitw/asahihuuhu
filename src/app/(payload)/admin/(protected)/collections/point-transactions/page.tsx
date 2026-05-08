import { Coins } from 'lucide-react'
import Link from 'next/link'
import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '點數紀錄' }
export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral' }> = {
  earn:               { label: '購物獲得', variant: 'success' },
  redeem:             { label: '兌換折扣', variant: 'warning' },
  expire:             { label: '點數到期', variant: 'danger' },
  adjust:             { label: '手動調整', variant: 'info' },
  registration_bonus: { label: '註冊獎勵', variant: 'brand' },
  birthday_bonus:     { label: '生日獎勵', variant: 'neutral' },
}

export default async function PointTransactionsPage() {
  const payload = await getAdminPayload()
  const { docs, totalDocs } = await payload.find({
    collection: 'point-transactions',
    limit: 200,
    sort: '-createdAt',
    overrideAccess: true,
    depth: 1,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-adm-text-primary">點數紀錄</h1>
        <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 筆交易（顯示最新 200 筆）</p>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState
            icon={<Coins className="h-6 w-6" />}
            title="尚無點數紀錄"
            description="會員獲得或兌換點數後將在此顯示"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['顧客', '類型', '點數', '餘額', '說明', '訂單號', '日期'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((tx: any) => {
                  const tl = TYPE_LABELS[tx.type] ?? { label: tx.type ?? '—', variant: 'neutral' as const }
                  const customer = tx.customer
                  const customerName =
                    typeof customer === 'object' && customer !== null
                      ? (customer.name ?? customer.email ?? `#${customer.id}`)
                      : customer ?? '—'
                  const customerId =
                    typeof customer === 'object' && customer !== null ? customer.id : null
                  const order = tx.order
                  const orderNumber =
                    typeof order === 'object' && order !== null
                      ? (order.orderNumber ?? `#${order.id}`)
                      : null

                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-adm-text-primary whitespace-nowrap">
                        {customerId ? (
                          <Link
                            href={`/admin/collections/customers/${customerId}`}
                            className="hover:underline text-adm-brand-600"
                          >
                            {customerName}
                          </Link>
                        ) : (
                          customerName
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={tl.variant as any} size="sm">{tl.label}</Badge>
                      </td>
                      <td className={`px-5 py-3.5 text-sm tabular-nums font-medium ${tx.points >= 0 ? 'text-adm-success-600' : 'text-adm-danger-600'}`}>
                        {tx.points >= 0 ? `+${tx.points}` : tx.points}
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-secondary">
                        {tx.balance ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-adm-text-secondary max-w-xs truncate">
                        {tx.description ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono text-adm-text-secondary">
                        {orderNumber ? (
                          typeof order === 'object' && order?.id ? (
                            <Link
                              href={`/admin/collections/orders/${order.id}`}
                              className="hover:underline text-adm-brand-600"
                            >
                              {orderNumber}
                            </Link>
                          ) : (
                            orderNumber
                          )
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-adm-text-tertiary whitespace-nowrap">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('zh-TW') : '—'}
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
