import Link from 'next/link'
import { Users } from 'lucide-react'
import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '會員管理' }
export const dynamic = 'force-dynamic'

const TIER_LABELS: Record<string, { label: string; variant: 'neutral' | 'info' | 'warning' }> = {
  regular: { label: '一般會員', variant: 'neutral' },
  silver:  { label: '銀卡會員', variant: 'info' },
  gold:    { label: '金卡會員', variant: 'warning' },
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const payload = await getAdminPayload()

  const where: Record<string, any> = q
    ? {
        or: [
          { name: { like: q } },
          { email: { like: q } },
        ],
      }
    : {}

  const { docs, totalDocs } = await payload.find({
    collection: 'customers',
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
    where,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-adm-text-primary">會員管理</h1>
        <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 位會員</p>
      </div>

      {/* Search */}
      <form method="GET">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="搜尋姓名或 Email…"
          className="h-9 w-full max-w-sm rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
        />
      </form>

      <Card>
        {docs.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="尚無會員"
            description={q ? `找不到符合「${q}」的會員` : '顧客註冊後將在此顯示'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['姓名', 'Email', '電話', '等級', '點數', '累計消費', '生日', '加入日期', ''].map((h) => (
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
                  const tier = TIER_LABELS[c.tier ?? 'regular'] ?? TIER_LABELS.regular
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-adm-text-primary whitespace-nowrap">
                        {c.name ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-adm-text-secondary">{c.email ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-adm-text-secondary whitespace-nowrap">{c.phone ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={tier.variant} size="sm">{tier.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-primary">
                        {Number(c.points ?? 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-primary whitespace-nowrap">
                        {`NT$ ${Number(c.totalSpent ?? 0).toLocaleString()}`}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-adm-text-tertiary whitespace-nowrap">
                        {c.birthday
                          ? new Date(c.birthday).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-adm-text-tertiary whitespace-nowrap">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString('zh-TW') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/collections/customers/${c.id}`}
                          className="text-xs text-adm-brand-600 hover:underline"
                        >
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
