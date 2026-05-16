import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { SiteSettingsForm } from './SiteSettingsForm'

export const metadata = { title: '網站設定' }
export const dynamic = 'force-dynamic'

export default async function SiteSettingsPage() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value

  if (!sessionCookie) redirect('/admin/dashboard')

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const uid = decoded.uid

    // Firestore is source of truth for role
    let role: string | undefined
    const userDoc = await adminDb.collection('users').doc(uid).get()
    if (userDoc.exists) role = (userDoc.data() as any)?.role
    if (!role) role = (decoded as any).role

    if (role !== 'super-admin') redirect('/admin/dashboard')
  } catch {
    redirect('/admin/dashboard')
  }

  let data: any = null
  try {
    const snap = await adminDb.collection('settings').doc('site-settings').get()
    data = snap.exists ? snap.data() : null
  } catch {
    // DB not ready yet — render form with empty defaults
  }
  return <SiteSettingsForm initialData={data} />
}
