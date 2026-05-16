import 'server-only'
import { getProducts as fsGetProducts, getProductBySlug as fsGetProductBySlug } from '@/lib/firestore/admin'
import type { Locale } from '@/lib/firestore/types'

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
  description?: any
  seo?: { title?: string; description?: string }
}

export async function getProducts(locale: string): Promise<CmsProduct[]> {
  try {
    return (await fsGetProducts(locale as Locale, true)) as CmsProduct[]
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string, locale: string): Promise<CmsProductDetail | null> {
  try {
    return (await fsGetProductBySlug(slug, locale as Locale)) as CmsProductDetail | null
  } catch {
    return null
  }
}
