import { adminDb } from '@/lib/firebase/admin'
import { HomePageForm } from './HomePageForm'

export const metadata = { title: '首頁設定' }
export const dynamic = 'force-dynamic'

export default async function HomePageSettingsPage() {
  let data: any = null
  try {
    const snap = await adminDb.collection('settings').doc('home-page').get()
    data = snap.exists ? snap.data() : null
  } catch {
    // DB not ready yet — render form with empty defaults
  }
  return <HomePageForm initialData={data as any} />
}
