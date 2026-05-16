import { adminDb } from '@/lib/firebase/admin'
import { ProductForm } from '../ProductForm'
import { notFound } from 'next/navigation'

export const metadata = { title: '編輯商品' }
export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('products').doc(id).get()
  const data = snap.exists ? { id: snap.id, ...snap.data() } : null
  if (!data) notFound()
  return <ProductForm initialData={data} id={id} />
}
