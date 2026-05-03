import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { FAQForm } from '../FAQForm'
import { notFound } from 'next/navigation'

export const metadata = { title: '編輯問答' }
export const dynamic = 'force-dynamic'

export default async function EditFAQPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  try {
    const faq = await payload.findByID({ collection: 'faqs', id, locale: 'zh-TW' })
    return <FAQForm initialData={faq} id={id} />
  } catch {
    notFound()
  }
}
