import { getAdminPayload, STATUS_LABELS } from '@/app/(payload)/admin/_lib/payload'
import { notFound } from 'next/navigation'
import { OrderDetailClient } from './OrderDetailClient'

export const metadata = { title: '訂單詳情' }
export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  try {
    const order = await payload.findByID({ collection: 'orders', id })
    return <OrderDetailClient order={order as any} statusLabels={STATUS_LABELS} />
  } catch {
    notFound()
  }
}
