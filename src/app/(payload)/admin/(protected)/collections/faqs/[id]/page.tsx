import { adminDb } from '@/lib/firebase/admin'
import { FAQForm } from '../FAQForm'
import { notFound } from 'next/navigation'

export const metadata = { title: '編輯問答' }
export const dynamic = 'force-dynamic'

export default async function EditFAQPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('faqs').doc(id).get()
  const faq = snap.exists ? { id: snap.id, ...snap.data() } : null
  if (!faq) notFound()
  return <FAQForm initialData={faq} id={id} />
}
