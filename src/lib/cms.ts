import 'server-only'
import {
  getNewsItems as fsGetNewsItems,
  getNewsItem as fsGetNewsItem,
  getFAQs as fsGetFAQs,
  getHomePage,
  getAboutPage,
  getSiteSettings as fsGetSiteSettings,
  getShopPage,
  getFeatureFlags as fsGetFeatureFlags,
} from '@/lib/firestore/admin'
import type { Locale } from '@/lib/firestore/types'

export async function getNewsItems(locale: string, limit = 20) {
  try {
    return await fsGetNewsItems(locale as Locale, limit)
  } catch {
    return null
  }
}

export async function getNewsItem(slug: string, locale: string) {
  try {
    return await fsGetNewsItem(slug, locale as Locale)
  } catch {
    return null
  }
}

export async function getFAQs(locale: string) {
  try {
    return await fsGetFAQs(locale as Locale)
  } catch {
    return null
  }
}

export async function getHomePageGlobal(locale: string) {
  try {
    return await getHomePage(locale as Locale)
  } catch {
    return null
  }
}

export async function getAboutPageGlobal(locale: string) {
  try {
    return await getAboutPage(locale as Locale)
  } catch {
    return null
  }
}

export async function getSiteSettings(locale: string) {
  try {
    return await fsGetSiteSettings(locale as Locale)
  } catch {
    return null
  }
}

export async function getShopPageGlobal(locale: string) {
  try {
    return await getShopPage(locale as Locale)
  } catch {
    return null
  }
}

export async function getFeatureFlags() {
  try {
    return await fsGetFeatureFlags()
  } catch {
    return null
  }
}
