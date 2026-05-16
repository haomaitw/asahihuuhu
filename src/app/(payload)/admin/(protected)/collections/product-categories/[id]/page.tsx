import { notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase/admin'
import { CategoryForm } from '../CategoryForm'

export const metadata = { title: '編輯商品分類' }
export const dynamic = 'force-dynamic'

export default async function EditProductCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('product-categories').doc(id).get()
  if (!snap.exists) notFound()
  const cat = { id: snap.id, ...snap.data() }
  return <CategoryForm initialData={cat} isEdit />
}
