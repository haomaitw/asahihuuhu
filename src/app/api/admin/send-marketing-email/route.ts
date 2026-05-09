import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { audience, subject, content } = await req.json()

    if (!subject || !content) {
      return NextResponse.json({ error: '主旨與內容為必填' }, { status: 400 })
    }

    // Build where query based on audience
    let where: Record<string, any> = {}
    if (audience === 'marketing') {
      where = { marketingConsent: { equals: true } }
    } else if (audience === 'gold') {
      where = { tier: { equals: 'gold' } }
    } else if (audience === 'silver_and_above') {
      where = { tier: { in: ['silver', 'gold'] } }
    }
    // 'all' = no where filter

    const { docs } = await payload.find({
      collection: 'customers',
      where,
      limit: 2000,
      overrideAccess: true,
      select: { email: true, name: true },
    })

    // Send emails
    let sent = 0
    let failed = 0
    for (const customer of docs) {
      if (!customer.email) continue
      try {
        await payload.sendEmail({
          to: customer.email,
          subject,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              ${content.replace(/\n/g, '<br>')}
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
              <p style="font-size:12px;color:#9ca3af;text-align:center;">
                朝日夫婦 · 淡水河畔<br>
                如不希望收到此類郵件，請至會員中心取消訂閱
              </p>
            </div>
          `,
        })
        sent++
      } catch {
        failed++
      }
    }

    return NextResponse.json({ ok: true, sent, failed, total: docs.length })
  } catch (err: any) {
    console.error('send-marketing-email error:', err)
    return NextResponse.json({ error: err.message ?? '發送失敗' }, { status: 500 })
  }
}
