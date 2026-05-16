import Link from 'next/link'
import { Plus, Tag } from 'lucide-react'
import { adminDb } from '@/lib/firebase/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '優惠券管理' }
export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, { label: string; variant: 'brand' | 'info' | 'success' }> = {
  percentage:   { label: '折扣碼',   variant: 'brand' },
  fixed_amount: { label: '固定金額', variant: 'info' },
  free_shipping: { label: '免運費',  variant: 'success' },
}

export default async function CouponsPage() {
  const snap = await adminDb.collection('coupons').orderBy('createdAt', 'desc').limit(100).get()
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
  const totalDocs = docs.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">優惠券管理</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 張優惠券</p>
        </div>
        <Link href="/admin/collections/coupons/new">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" />
            新增優惠券
          </Button>
        </Link>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState
            icon={<Tag className="h-6 w-6" />}
            title="尚無優惠券"
            description="點擊「新增優惠券」建立第一張折扣碼"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['代碼', '類型', '折扣值', '最低消費', '使用次數', '有效期間', '狀態', ''].map((h) => (
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
                {docs.map((c: any) => {
                  const tl = TYPE_LABELS[c.type] ?? { label: c.type, variant: 'neutral' as const }
                  const usesLabel =
                    c.maxUses
                      ? `${c.currentUses ?? 0} / ${c.maxUses}`
                      : `${c.currentUses ?? 0} / ∞`
                  const valueLabel =
                    c.type === 'percentage'
                      ? `${c.value ?? 0}%`
                      : c.type === 'fixed_amount'
                      ? `NT$ ${(c.value ?? 0).toLocaleString()}`
                      : '—'
                  const validLabel = [
                    c.validFrom ? new Date(c.validFrom).toLocaleDateString('zh-TW') : null,
                    c.validUntil ? new Date(c.validUntil).toLocaleDateString('zh-TW') : null,
                  ]
                    .filter(Boolean)
                    .join(' ~ ') || '無期限'

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-adm-text-primary font-mono">
                        {c.code}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={tl.variant as any} size="sm">{tl.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-primary">{valueLabel}</td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-secondary">
                        {c.minOrderAmount ? `NT$ ${c.minOrderAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-secondary">{usesLabel}</td>
                      <td className="px-5 py-3.5 text-xs text-adm-text-tertiary whitespace-nowrap">{validLabel}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={c.isActive ? 'success' : 'neutral'} size="sm">
                          {c.isActive ? '啟用中' : '已停用'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/collections/coupons/${c.id}`}
                          className="text-xs text-adm-brand-600 hover:underline"
                        >
                          編輯
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
