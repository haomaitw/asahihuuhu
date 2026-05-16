import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { ProfileForm } from './ProfileForm'

export const metadata = { title: '個人資料' }
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value
  if (!sessionCookie) redirect('/admin/login')

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decoded.uid

    const doc = await adminDb.collection('users').doc(uid).get()
    const data = doc.exists ? (doc.data() as any) : {}

    let role: string = data.role ?? (decoded as any).role ?? 'staff'

    return (
      <ProfileForm
        initialName={data.name ?? decoded.name ?? ''}
        email={decoded.email ?? ''}
        role={role}
      />
    )
  } catch {
    redirect('/admin/login')
  }
}
