import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getProductBySlug, getProducts } from '@/lib/cms-products'
import { ProductDetailClient } from './ProductDetailClient'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  // Statically generate known slugs at build time (best-effort)
  try {
    const products = await getProducts('zh-TW')
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  try {
    const product = await getProductBySlug(slug, locale)
    if (!product) return {}
    const seoTitle = product.seo?.title || `${product.name} — 朝日夫婦`
    const seoDesc = product.seo?.description || product.shortDescription || '朝日夫婦精選冰品'
    return {
      title: seoTitle,
      description: seoDesc,
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        images: [{ url: product.image }],
      },
    }
  } catch {
    return {}
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  let product = null
  try {
    product = await getProductBySlug(slug, locale)
  } catch {
    // DB not ready
  }

  if (!product) notFound()

  return <ProductDetailClient product={product} locale={locale} />
}
