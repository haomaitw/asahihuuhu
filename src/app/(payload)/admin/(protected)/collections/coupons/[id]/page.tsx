import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { notFound } from 'next/navigation'
import { CouponForm } from '../CouponForm'

export const metadata = { title: '編輯優惠券' }
export const dynamic = 'force-dynamic'

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  try {
    const coupon = await payload.findByID({
      collection: 'coupons',
      id,
      overrideAccess: true,
    })
    return <CouponForm initialData={coupon as any} />
  } catch {
    notFound()
  }
}
