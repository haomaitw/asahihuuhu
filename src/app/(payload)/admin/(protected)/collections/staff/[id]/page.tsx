import { notFound } from 'next/navigation'
import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { StaffForm } from '../StaffForm'

export const metadata = { title: '編輯成員' }
export const dynamic = 'force-dynamic'

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  let member: any
  try {
    member = await payload.findByID({ collection: 'staff', id, locale: 'zh-TW', depth: 1 })
  } catch { notFound() }
  if (!member) notFound()
  return <StaffForm initialData={member} isEdit />
}
