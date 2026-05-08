import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { UsersClient } from './UsersClient'

export const metadata = { title: '管理員帳號' }
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  // Fetch all users
  const { docs } = await payload.find({
    collection: 'users',
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })

  // Get current user for self-deletion guard
  let currentUserEmail = ''
  try {
    const { user } = await payload.auth({ headers: headersList })
    currentUserEmail = (user as any)?.email ?? ''
  } catch {
    // ignore
  }

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
