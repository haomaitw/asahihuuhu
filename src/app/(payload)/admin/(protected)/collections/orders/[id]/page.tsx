import { adminDb } from '@/lib/firebase/admin'
import { STATUS_LABELS } from '@/app/(payload)/admin/_lib/payload'
import { notFound } from 'next/navigation'
import { OrderDetailClient } from './OrderDetailClient'

export const metadata = { title: '訂單詳情' }
export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('orders').doc(id).get()
  const order = snap.exists ? { id: snap.id, ...snap.data() } : null
  if (!order) notFound()
  return <OrderDetailClient order={order as any} statusLabels={STATUS_LABELS} />
}
