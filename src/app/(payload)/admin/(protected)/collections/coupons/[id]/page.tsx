import { adminDb } from '@/lib/firebase/admin'
import { notFound } from 'next/navigation'
import { CouponForm } from '../CouponForm'

export const metadata = { title: '編輯優惠券' }
export const dynamic = 'force-dynamic'

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('coupons').doc(id).get()
  if (!snap.exists) notFound()
  const coupon = { id: snap.id, ...snap.data() }
  return <CouponForm initialData={coupon as any} />
}
