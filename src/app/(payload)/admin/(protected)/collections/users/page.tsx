import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { Users, UserPlus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const metadata = { title: '使用者' }
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const payload = await getAdminPayload()
  const { docs, totalDocs } = await payload.find({
    collection: 'users',
    limit: 100,
    sort: '-createdAt',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-adm-text-primary">使用者</h1>
        <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 位管理員</p>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState icon={Users} title="尚無使用者" description="請透過 Payload 管理介面新增管理員帳號" />
        ) : (
          <div className="divide-y divide-adm-border-subtle">
            {docs.map((u: any) => {
              const initials = (u.name ?? u.email ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              return (
                <div key={u.id} className="flex items-center gap-4 px-5 py-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-adm-text-primary">{u.name ?? '未命名'}</p>
                    <p className="text-xs text-adm-text-tertiary">{u.email}</p>
                  </div>
                  <span className="text-xs text-adm-text-disabled">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('zh-TW') : ''}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <div className="rounded-adm-xl border border-adm-border-subtle bg-adm-bg-sunken p-4 flex items-center gap-3 text-sm text-adm-text-secondary">
        <UserPlus className="h-4 w-4 text-adm-text-tertiary shrink-0" />
        <span>如需新增管理員，請使用 Payload 原生管理介面：<code className="text-adm-brand-600 font-mono text-xs">/api/users</code></span>
      </div>
    </div>
  )
}
