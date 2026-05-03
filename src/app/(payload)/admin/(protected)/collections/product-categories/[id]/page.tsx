import { notFound } from 'next/navigation'
import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { CategoryForm } from '../CategoryForm'

export const metadata = { title: '編輯商品分類' }
export const dynamic = 'force-dynamic'

export default async function EditProductCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  let cat: any
  try {
    cat = await payload.findByID({ collection: 'product-categories', id, locale: 'zh-TW' })
  } catch { notFound() }
  if (!cat) notFound()
  return <CategoryForm initialData={cat} isEdit />
}
