import { adminDb } from '@/lib/firebase/admin'
import { NewsForm } from '../NewsForm'
import { notFound } from 'next/navigation'

export const metadata = { title: '編輯消息' }
export const dynamic = 'force-dynamic'

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('news').doc(id).get()
  const news = snap.exists ? { id: snap.id, ...snap.data() } : null
  if (!news) notFound()
  return <NewsForm initialData={news} id={id} />
}
