import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { UsersClient } from './UsersClient'

export const metadata = { title: '帳號管理' }
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value

  if (!sessionCookie) redirect('/admin/login')

  let currentUser: any = null
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const snap = await adminDb.collection('users').doc(decoded.uid).get()

    // If Firestore doc doesn't exist yet, fall back to token claims
    if (snap.exists) {
      currentUser = { id: snap.id, ...snap.data() }
    } else {
      const role = (decoded as any).role
      if (!role) redirect('/admin/login')
      currentUser = { id: decoded.uid, email: decoded.email, role }
    }
  } catch {
    redirect('/admin/login')
  }

  if (!currentUser) redirect('/admin/login')

  if (!['super-admin', 'admin'].includes(currentUser.role)) {
    redirect('/admin/dashboard')
  }

  // Fetch users without orderBy to avoid excluding docs with missing createdAt.
  // Sort in JS after fetching.
  let usersSnap
  try {
    if (currentUser.role === 'super-admin') {
      usersSnap = await adminDb.collection('users').limit(200).get()
    } else {
      usersSnap = await adminDb.collection('users').where('role', '==', 'staff').limit(200).get()
    }
  } catch {
    usersSnap = { docs: [] as any[] }
  }

  const users = usersSnap.docs
    .map((d: any) => {
      const data = d.data()
      return {
        id: d.id,
        name: data.name ?? null,
        email: data.email ?? '',
        role: data.role ?? 'staff',
        createdAt: data.createdAt ? String(data.createdAt) : undefined,
      }
    })
    .sort((a: any, b: any) => {
      // Newest first; put entries without createdAt at the end
      if (!a.createdAt && !b.createdAt) return 0
      if (!a.createdAt) return 1
      if (!b.createdAt) return -1
      return b.createdAt.localeCompare(a.createdAt)
    })

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
