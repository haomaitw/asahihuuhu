/**
 * POST /api/seed-default-data
 *
 * Creates default Firestore settings documents so the site works out of the box.
 * Safe to run multiple times — uses { merge: true } so existing data is preserved.
 *
 * Body: { secret: string }
 */
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = adminDb.collection('settings')

    await Promise.all([
      settings.doc('feature-flags').set({
        maintenanceMode: {
          enabled: false,
          message: { 'zh-TW': '網站維護中，請稍後再試。', en: 'Site under maintenance, please try again later.' },
        },
      }, { merge: true }),

      settings.doc('site-settings').set({
        copyright: '© 2025 朝日夫婦',
        address: { 'zh-TW': '251 新北市淡水區中正路 233-3 號', en: '233-3 Zhongzheng Rd, Tamsui, New Taipei City 251' },
        emailSettings: {
          fromName: '朝日夫婦',
          fromAddress: process.env.EMAIL_FROM ?? 'noreply@asahihuuhu.com',
          orderConfirmationEnabled: true,
        },
        tcat: {
          temperature: '0003',
          distance: '00',
        },
      }, { merge: true }),

      settings.doc('home-page').set({
        tagline1: { 'zh-TW': '朝日夫婦', en: 'Asahi Fuufu', ja: '朝日夫婦' },
        tagline2: { 'zh-TW': '職人堅持的日式刨冰', en: 'Artisan Japanese Shaved Ice', ja: '職人こだわりの日式かき氷' },
        heroLede: { 'zh-TW': '用心製作，每一碗都是季節的味道', en: 'Crafted with care, every bowl is a taste of the season' },
      }, { merge: true }),

      settings.doc('shop-page').set({
        heroTitle: { 'zh-TW': '線上選購', en: 'Shop Online', ja: 'オンラインショップ' },
        heroSubtitle: { 'zh-TW': '精選冰品，宅配到府', en: 'Premium ice desserts delivered to your door' },
      }, { merge: true }),

      settings.doc('about-page').set({}, { merge: true }),
    ])

    return NextResponse.json({
      ok: true,
      message: '✅ 預設資料已建立：feature-flags, site-settings, home-page, shop-page, about-page',
    })
  } catch (err: any) {
    console.error('[seed-default-data]', err)
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}
