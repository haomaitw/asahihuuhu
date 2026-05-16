import { notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase/admin'
import { NewsCategoryForm } from '../NewsCategoryForm'

export const metadata = { title: '編輯文章分類' }
export const dynamic = 'force-dynamic'

export default async function EditNewsCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('news-categories').doc(id).get()
  if (!snap.exists) notFound()
  const cat = { id: snap.id, ...snap.data() }
  return <NewsCategoryForm initialData={cat} isEdit />
}
