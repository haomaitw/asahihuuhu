import { getPayload } from 'payload'
import configPromise from '@payload-config'

export type CmsProduct = {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: 'goods' | 'seasonal'
  shortDescription?: string
  isAvailable: boolean
}

export async function getProducts(locale: string): Promise<CmsProduct[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'products',
    locale: locale as 'zh-TW' | 'en' | 'ja',
    where: { isAvailable: { equals: true } },
    depth: 1,
  })
  return result.docs.map((doc) => ({
    id: String(doc.id),
    name: doc.name as string,
    slug: doc.slug as string,
    price: doc.price as number,
    image: (doc.images as any[])?.[0]?.url ?? '/asahi/ice-3.png',
    category: doc.category as 'goods' | 'seasonal',
    shortDescription: doc.shortDescription as string | undefined,
    isAvailable: doc.isAvailable as boolean,
  }))
}
