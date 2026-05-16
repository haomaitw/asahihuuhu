import Link from 'next/link'
import { Plus, UserCircle } from 'lucide-react'
import { adminDb } from '@/lib/firebase/admin'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '團隊成員' }
export const dynamic = 'force-dynamic'

export default async function StaffPage() {
  const snap = await adminDb.collection('staff').orderBy('order', 'asc').limit(100).get()
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
  const totalDocs = docs.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">團隊成員</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 位成員</p>
        </div>
        <Link href="/admin/collections/staff/create">
          <Button variant="primary" size="md"><Plus className="h-4 w-4" /> 新增成員</Button>
        </Link>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState icon={<UserCircle className="h-6 w-6" />} title="尚無團隊成員" description="點擊「新增成員」建立員工資料" />
        ) : (
          <div className="divide-y divide-adm-border-subtle">
            {docs.map((member: any) => (
              <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-adm-brand-50/40 transition-colors">
                {member.photo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photo.url} alt={typeof member.name === 'object' ? (member.name?.['zh-TW'] ?? '') : (member.name ?? '')} className="h-10 w-10 rounded-full object-cover bg-adm-bg-sunken shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-adm-bg-sunken flex items-center justify-center shrink-0">
                    <UserCircle className="h-6 w-6 text-adm-text-tertiary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-adm-text-primary">
                    {typeof member.name === 'object' ? (member.name?.['zh-TW'] ?? '') : (member.name ?? '—')}
                  </p>
                  <p className="text-xs text-adm-text-tertiary">
                    {typeof member.position === 'object' ? (member.position?.['zh-TW'] ?? '') : (member.position ?? '')}
                  </p>
                </div>
                <span className="text-xs tabular-nums text-adm-text-disabled w-6 shrink-0 text-right">{member.order ?? 0}</span>
                <Link href={`/admin/collections/staff/${member.id}`} className="text-xs text-adm-brand-600 hover:underline shrink-0">
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
