import { notFound } from 'next/navigation'
import { adminDb } from '@/lib/firebase/admin'
import { StaffForm } from '../StaffForm'

export const metadata = { title: '編輯成員' }
export const dynamic = 'force-dynamic'

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const snap = await adminDb.collection('staff').doc(id).get()
  if (!snap.exists) notFound()
  const member = { id: snap.id, ...snap.data() }
  return <StaffForm initialData={member} isEdit />
}
