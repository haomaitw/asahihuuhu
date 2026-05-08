import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { notFound } from 'next/navigation'
import { CustomerDetailClient } from './CustomerDetailClient'

export const metadata = { title: '會員詳情' }
export const dynamic = 'force-dynamic'

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  try {
    const customer = await payload.findByID({
      collection: 'customers',
      id,
      overrideAccess: true,
    })
    return <CustomerDetailClient customer={customer as any} />
  } catch {
    notFound()
  }
}
