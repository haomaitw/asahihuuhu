import { adminDb } from '@/lib/firebase/admin'
import { SiteSettingsForm } from './SiteSettingsForm'

export const metadata = { title: '網站設定' }
export const dynamic = 'force-dynamic'

export default async function SiteSettingsPage() {
  let data: any = null
  try {
    const snap = await adminDb.collection('settings').doc('site-settings').get()
    data = snap.exists ? snap.data() : null
  } catch {
    // DB not ready yet — render form with empty defaults
  }
  return <SiteSettingsForm initialData={data} />
}
