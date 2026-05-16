import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { UsersClient } from './UsersClient'

export const metadata = { title: '帳號管理' }
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  // Verify the session cookie and get the current user from Firestore
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) redirect('/admin/login')

  let currentUser: any = null
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const snap = await adminDb.collection('users').doc(decoded.uid).get()
    if (!snap.exists) redirect('/admin/login')
    currentUser = { id: snap.id, ...snap.data() }
  } catch {
    redirect('/admin/login')
  }

  if (!currentUser) redirect('/admin/login')

  // Only super-admin and admin can access this page
  if (!['super-admin', 'admin'].includes(currentUser.role)) {
    redirect('/admin/dashboard')
  }

  // Fetch users from Firestore
  // super-admin sees all; admin only sees staff
  let usersSnap
  if (currentUser.role === 'super-admin') {
    usersSnap = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(100).get()
  } else {
    usersSnap = await adminDb
      .collection('users')
      .where('role', '==', 'staff')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()
  }

  const users = usersSnap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name ?? null,
      email: data.email,
      role: data.role ?? 'staff',
      createdAt: data.createdAt ? String(data.createdAt) : undefined,
    }
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
