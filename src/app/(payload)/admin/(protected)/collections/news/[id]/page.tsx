import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { NewsForm } from '../NewsForm'
import { notFound } from 'next/navigation'

export const metadata = { title: '編輯消息' }
export const dynamic = 'force-dynamic'

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  try {
    const news = await payload.findByID({ collection: 'news', id, locale: 'zh-TW' })
    return <NewsForm initialData={news} id={id} />
  } catch {
    notFound()
  }
}
