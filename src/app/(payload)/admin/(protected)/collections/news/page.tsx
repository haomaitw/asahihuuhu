import Link from 'next/link'
import { Plus, Newspaper } from 'lucide-react'
import { getAdminPayload, STATUS_LABELS } from '@/app/(payload)/admin/_lib/payload'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '最新消息' }
export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const payload = await getAdminPayload()
  const { docs, totalDocs } = await payload.find({
    collection: 'news',
    locale: 'zh-TW',
    limit: 100,
    sort: '-date',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">最新消息</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 篇</p>
        </div>
        <Link href="/admin/collections/news/create">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" /> 新增消息
          </Button>
        </Link>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState icon={Newspaper} title="尚無消息" description="點擊「新增消息」發布第一則公告" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['標題', '日期', '狀態', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((n: any) => {
                  const s = STATUS_LABELS[n.status ?? ''] ?? { label: n.status ?? '—', variant: 'neutral' }
                  return (
                    <tr key={n.id} className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-adm-text-primary">{n.title ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-adm-text-secondary tabular-nums">
                        {n.date ? new Date(n.date).toLocaleDateString('zh-TW') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={s.variant as any} size="sm">{s.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/collections/news/${n.id}`} className="text-xs text-adm-brand-600 hover:underline">
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
