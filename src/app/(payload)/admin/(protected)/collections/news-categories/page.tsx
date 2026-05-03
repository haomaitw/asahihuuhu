import Link from 'next/link'
import { Plus, FolderOpen } from 'lucide-react'
import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '文章分類' }
export const dynamic = 'force-dynamic'

export default async function NewsCategoriesPage() {
  const payload = await getAdminPayload()
  const { docs, totalDocs } = await payload.find({
    collection: 'news-categories',
    locale: 'zh-TW',
    limit: 100,
    sort: 'createdAt',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">文章分類</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 個分類</p>
        </div>
        <Link href="/admin/collections/news-categories/create">
          <Button variant="primary" size="md"><Plus className="h-4 w-4" /> 新增分類</Button>
        </Link>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState icon={<FolderOpen className="h-6 w-6" />} title="尚無文章分類" description="點擊「新增分類」建立文章分類" />
        ) : (
          <div className="divide-y divide-adm-border-subtle">
            {docs.map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-adm-brand-50/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-adm-text-primary">{cat.name ?? '—'}</p>
                  <p className="text-xs text-adm-text-tertiary font-mono">{cat.slug}</p>
                </div>
                <Link href={`/admin/collections/news-categories/${cat.id}`} className="text-xs text-adm-brand-600 hover:underline shrink-0">
                  編輯
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
