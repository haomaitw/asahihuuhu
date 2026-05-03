import Link from 'next/link'
import { Plus, HelpCircle } from 'lucide-react'
import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '常見問答' }
export const dynamic = 'force-dynamic'

export default async function FAQsPage() {
  const payload = await getAdminPayload()
  const { docs, totalDocs } = await payload.find({
    collection: 'faqs',
    locale: 'zh-TW',
    limit: 100,
    sort: 'order',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">常見問答</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 則</p>
        </div>
        <Link href="/admin/collections/faqs/create">
          <Button variant="primary" size="md"><Plus className="h-4 w-4" /> 新增問答</Button>
        </Link>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState icon={HelpCircle} title="尚無問答" description="點擊「新增問答」建立常見問題" />
        ) : (
          <div className="divide-y divide-adm-border-subtle">
            {docs.map((faq: any) => (
              <div key={faq.id} className="flex items-start gap-4 px-5 py-4 hover:bg-adm-brand-50/40 transition-colors">
                <span className="mt-0.5 text-xs tabular-nums text-adm-text-disabled w-6 shrink-0">{faq.order ?? 0}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-adm-text-primary line-clamp-1">{faq.question ?? '—'}</p>
                  <p className="text-xs text-adm-text-tertiary mt-0.5 line-clamp-2">{faq.answer ?? ''}</p>
                </div>
                <Link href={`/admin/collections/faqs/${faq.id}`} className="text-xs text-adm-brand-600 hover:underline shrink-0">
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
