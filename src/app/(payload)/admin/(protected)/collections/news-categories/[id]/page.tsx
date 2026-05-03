import { notFound } from 'next/navigation'
import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { NewsCategoryForm } from '../NewsCategoryForm'

export const metadata = { title: '編輯文章分類' }
export const dynamic = 'force-dynamic'

export default async function EditNewsCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  let cat: any
  try {
    cat = await payload.findByID({ collection: 'news-categories', id, locale: 'zh-TW' })
  } catch { notFound() }
  if (!cat) notFound()
  return <NewsCategoryForm initialData={cat} isEdit />
}
