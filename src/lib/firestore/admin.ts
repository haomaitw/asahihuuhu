import 'server-only'
import { adminDb } from '@/lib/firebase/admin'
import type { Locale, Product, Order, NewsItem, FaqItem, ProductCategory, SiteSettings, HomePage, ShopPage } from './types'

function localized(val: any, locale: Locale): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  return val[locale] ?? val['zh-TW'] ?? ''
}

// ── Products ────────────────────────────────────────────────────────────────

export async function getProducts(locale: Locale = 'zh-TW', onlyAvailable = true): Promise<any[]> {
  let q: any = adminDb.collection('products').orderBy('createdAt', 'desc')
  const snap = await q.get()
  return snap.docs
    .map((d: any) => {
      const data = d.data() as Product
      if (onlyAvailable && !data.isAvailable) return null
      return formatProduct(d.id, data, locale)
    })
    .filter(Boolean)
}

export async function getProductBySlug(slug: string, locale: Locale = 'zh-TW') {
  const snap = await adminDb.collection('products').where('slug', '==', slug).limit(1).get()
  if (snap.empty) return null
  const d = snap.docs[0]
  return formatProduct(d.id, d.data() as Product, locale)
}

export async function getAllProducts(locale: Locale = 'zh-TW') {
  const snap = await adminDb.collection('products').orderBy('createdAt', 'desc').get()
  return snap.docs.map((d: any) => formatProduct(d.id, d.data() as Product, locale))
}

function formatProduct(id: string, data: Product, locale: Locale) {
  const imgs = Array.isArray(data.images) ? data.images.filter((u) => typeof u === 'string') : []
  return {
    id,
    name: localized(data.name, locale),
    slug: data.slug,
    price: data.price,
    comparePrice: data.comparePrice,
    image: imgs[0] ?? '/asahi/ice-3.png',
    images: imgs.length > 0 ? imgs : ['/asahi/ice-3.png'],
    category: data.category,
    categoryName: data.categoryName,
    shortDescription: localized(data.shortDescription, locale),
    description: data.description,
    trackStock: data.trackStock ?? true,
    stock: data.stock ?? 0,
    isAvailable: data.isAvailable ?? true,
    seo: data.seo
      ? {
          title: localized(data.seo.title, locale),
          description: localized(data.seo.description, locale),
        }
      : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

// ── News ────────────────────────────────────────────────────────────────────

export async function getNewsItems(locale: Locale = 'zh-TW', limit = 20) {
  const snap = await adminDb
    .collection('news')
    .where('status', '==', 'published')
    .orderBy('date', 'desc')
    .limit(limit)
    .get()
  return snap.docs.map((d: any) => {
    const data = d.data() as NewsItem
    return {
      id: d.id,
      slug: data.slug,
      date: data.date ? data.date.slice(0, 10) : '',
      title: localized(data.title, locale),
      body: data.body,
    }
  })
}

export async function getNewsItem(slug: string, locale: Locale = 'zh-TW') {
  const snap = await adminDb
    .collection('news')
    .where('slug', '==', slug)
    .where('status', '==', 'published')
    .limit(1)
    .get()
  if (snap.empty) return null
  const d = snap.docs[0]
  const data = d.data() as NewsItem
  return {
    id: d.id,
    slug: data.slug,
    date: data.date ? data.date.slice(0, 10) : '',
    title: localized(data.title, locale),
    body: data.body,
  }
}

// ── FAQs ────────────────────────────────────────────────────────────────────

export async function getFAQs(locale: Locale = 'zh-TW') {
  const snap = await adminDb.collection('faqs').orderBy('order', 'asc').get()
  return snap.docs.map((d: any) => {
    const data = d.data() as FaqItem
    return {
      id: d.id,
      question: localized(data.question, locale),
      answer: localized(data.answer, locale),
      order: data.order,
    }
  })
}

// ── Settings ─────────────────────────────────────────────────────────────────

async function getSettingsDoc(slug: string) {
  const snap = await adminDb.collection('settings').doc(slug).get()
  return snap.exists ? snap.data() : null
}

export async function getSiteSettings(locale: Locale = 'zh-TW'): Promise<any> {
  const data = (await getSettingsDoc('site-settings')) as SiteSettings | null
  if (!data) return null
  return {
    ...data,
    maintenanceMode: data.maintenanceMode
      ? {
          enabled: data.maintenanceMode.enabled,
          message: localized(data.maintenanceMode.message, locale),
        }
      : undefined,
    address: localized(data.address, locale),
    contact: localized(data.contact, locale),
    hoursWeekday: localized(data.hoursWeekday, locale),
    hoursWeekend: localized(data.hoursWeekend, locale),
    hoursClosed: localized(data.hoursClosed, locale),
    seoDescription: localized(data.seoDescription, locale),
  }
}

export async function getHomePage(locale: Locale = 'zh-TW'): Promise<any> {
  const data = (await getSettingsDoc('home-page')) as HomePage | null
  if (!data) return null
  return {
    ...data,
    tagline1: localized(data.tagline1, locale),
    tagline2: localized(data.tagline2, locale),
    heroLede: localized(data.heroLede, locale),
    seasonalTitle: localized(data.seasonalTitle, locale),
    seasonalDesc: localized(data.seasonalDesc, locale),
  }
}

export async function getShopPage(locale: Locale = 'zh-TW'): Promise<any> {
  const data = (await getSettingsDoc('shop-page')) as ShopPage | null
  if (!data) return null
  return {
    ...data,
    heroTitle: localized(data.heroTitle, locale),
    heroSubtitle: localized(data.heroSubtitle, locale),
    trustItems: (data.trustItems ?? []).map((item) => ({
      ...item,
      title: localized(item.title, locale),
      description: localized(item.description, locale),
    })),
  }
}

export async function getAboutPage(locale: Locale = 'zh-TW'): Promise<any> {
  return getSettingsDoc('about-page')
}

export async function getFeatureFlags(): Promise<any> {
  return getSettingsDoc('feature-flags')
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders(limit = 100) {
  const snap = await adminDb.collection('orders').orderBy('createdAt', 'desc').limit(limit).get()
  return snap.docs.map((d: any) => ({ ...(d.data() as Omit<Order, 'id'>), id: d.id }))
}

export async function getOrderById(id: string) {
  const snap = await adminDb.collection('orders').doc(id).get()
  if (!snap.exists) return null
  return { ...(snap.data() as Omit<Order, 'id'>), id: snap.id }
}

export async function getOrderByNumber(orderNumber: string) {
  const snap = await adminDb
    .collection('orders')
    .where('orderNumber', '==', orderNumber)
    .limit(1)
    .get()
  if (snap.empty) return null
  return { ...(snap.docs[0].data() as Omit<Order, 'id'>), id: snap.docs[0].id }
}

// ── Product categories ────────────────────────────────────────────────────────

export async function getProductCategories(locale: Locale = 'zh-TW') {
  const snap = await adminDb.collection('product-categories').orderBy('order', 'asc').get()
  return snap.docs.map((d: any) => {
    const data = d.data() as ProductCategory
    return { id: d.id, name: localized(data.name, locale), slug: data.slug, order: data.order }
  })
}
