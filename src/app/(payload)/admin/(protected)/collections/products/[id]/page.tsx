import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { ProductForm } from '../ProductForm'
import { notFound } from 'next/navigation'

export const metadata = { title: '編輯商品' }
export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getAdminPayload()
  try {
    const product = await payload.findByID({ collection: 'products', id, locale: 'zh-TW', depth: 1 })
    return <ProductForm initialData={product} id={id} />
  } catch {
    notFound()
  }
}
