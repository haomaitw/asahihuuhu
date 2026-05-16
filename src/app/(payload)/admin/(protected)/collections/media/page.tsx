import { adminDb } from '@/lib/firebase/admin'
import { MediaLibraryClient } from './MediaLibraryClient'
// MediaLibraryClient handles its own empty state with inline JSX

export const metadata = { title: '媒體庫' }
export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const snap = await adminDb.collection('media').orderBy('createdAt', 'desc').limit(100).get()
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[]
  const totalDocs = docs.length
  return <MediaLibraryClient docs={docs as any[]} total={totalDocs} />
}
