import { adminDb } from '@/lib/firebase/admin'
import { ShopPageForm } from './ShopPageForm'

export const metadata = { title: '商店頁面設定' }
export const dynamic = 'force-dynamic'

export default async function ShopPageSettingsPage() {
  let data: any = null
  try {
    const snap = await adminDb.collection('settings').doc('shop-page').get()
    data = snap.exists ? snap.data() : null
  } catch {
    // DB not ready yet — render form with empty defaults
  }
  return <ShopPageForm initialData={data} />
}
