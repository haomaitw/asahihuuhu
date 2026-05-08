import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { UsersClient } from './UsersClient'

export const metadata = { title: '管理員帳號' }
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  // Verify auth and enforce super-admin only
  let currentUser: any = null
  try {
    const result = await payload.auth({ headers: headersList })
    currentUser = result.user
  } catch {
    redirect('/admin/login')
  }

  if (!currentUser) redirect('/admin/login')
  if (currentUser.role !== 'super-admin') redirect('/admin/dashboard')

  // Fetch all users (super-admin only reaches here)
  const { docs } = await payload.find({
    collection: 'users',
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })

  const currentUserEmail = currentUser?.email ?? ''

  const users = docs.map((u: any) => ({
    id: u.id,
    name: u.name ?? null,
    email: u.email,
    role: u.role ?? 'admin',
    createdAt: u.createdAt,
  }))

  return (
    <div className="space-y-6">
      <UsersClient initialUsers={users} currentUserEmail={currentUserEmail} />
    </div>
  )
}
