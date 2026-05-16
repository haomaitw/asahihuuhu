import { adminDb } from '@/lib/firebase/admin'
import { notFound } from 'next/navigation'
import { CustomerDetailClient } from './CustomerDetailClient'

export const metadata = { title: '會員詳情' }
export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('customers').doc(id).get()
  if (!snap.exists) notFound()
  const customer = { id: snap.id, ...snap.data() }
  return <CustomerDetailClient customer={customer as any} />
}
