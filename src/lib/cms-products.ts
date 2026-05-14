import 'server-only'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export type CmsProduct = {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  images: string[]
  category: string
  shortDescription?: string
  isAvailable: boolean
  trackStock: boolean
  stock: number
}

export type CmsProductDetail = CmsProduct & {
  description?: any // Payload richText (Lexical)
  seo?: { title?: string; description?: string }
}

export async function getProducts(locale: string): Promise<CmsProduct[]> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'products',
    locale: locale as 'zh-TW' | 'en' | 'ja',
    where: { isAvailable: { equals: true } },
    depth: 1,
  })
  return result.docs.map((doc) => mapProduct(doc))
}

export async function getProductBySlug(slug: string, locale: string): Promise<CmsProductDetail | null> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'products',
    locale: locale as 'zh-TW' | 'en' | 'ja',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  const doc = result.docs[0]
  if (!doc) return null
  return {
    ...mapProduct(doc),
    description: (doc as any).description,
    seo: (doc as any).seo,
  }
}

function mapProduct(doc: any): CmsProduct {
  const imgs: string[] = (doc.images as any[] ?? [])
    .map((img: any) => img?.url ?? img)
    .filter((u: any) => typeof u === 'string' && u.startsWith('http'))
  return {
    id: String(doc.id),
    name: doc.name as string,
    slug: doc.slug as string,
    price: doc.price as number,
    comparePrice: (doc.comparePrice as number) || undefined,
    image: imgs[0] ?? '/asahi/ice-3.png',
    images: imgs.length > 0 ? imgs : ['/asahi/ice-3.png'],
    category: typeof doc.category === 'object' ? (doc.category?.slug ?? doc.category?.name ?? '') : (doc.category ?? ''),
    shortDescription: doc.shortDescription as string | undefined,
    isAvailable: doc.isAvailable as boolean,
    trackStock: (doc.trackStock as boolean) ?? true,
    stock: (doc.stock as number) ?? 0,
  }
}
