import { adminDb } from '@/lib/firebase/admin'
import { AboutPageForm } from './AboutPageForm'

export const metadata = { title: '關於設定' }
export const dynamic = 'force-dynamic'

export default async function AboutPageSettingsPage() {
  let data: any = null
  try {
    const snap = await adminDb.collection('settings').doc('about-page').get()
    if (snap.exists) data = { id: snap.id, ...snap.data() }
  } catch {
    // not ready — render form with defaults
  }
  return <AboutPageForm initialData={data} />
}
