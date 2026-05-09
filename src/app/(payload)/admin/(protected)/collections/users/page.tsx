import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { UsersClient } from './UsersClient'

export const metadata = { title: '帳號管理' }
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  let currentUser: any = null
  try {
    const result = await payload.auth({ headers: headersList })
    currentUser = result.user
  } catch {
    redirect('/admin/login')
  }

  if (!currentUser) redirect('/admin/login')

  // Only super-admin and admin can access this page
  if (!['super-admin', 'admin'].includes(currentUser.role)) {
    redirect('/admin/dashboard')
  }

  // super-admin sees all; admin only sees staff
  const where =
    currentUser.role === 'super-admin'
      ? undefined
      : { role: { equals: 'staff' } }

  const { docs } = await payload.find({
    collection: 'users',
    where,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const users = docs.map((u: any) => ({
    id: u.id,
    name: u.name ?? null,
    email: u.email,
    role: u.role ?? 'staff',
    createdAt: u.createdAt,
  }))

  return (
    <div className="space-y-6">
      <UsersClient
        initialUsers={users}
        currentUserEmail={currentUser?.email ?? ''}
        currentUserRole={currentUser?.role ?? 'staff'}
      />
    </div>
  )
}
