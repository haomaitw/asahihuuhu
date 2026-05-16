import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Verify Firebase session — only super-admin / admin can send marketing emails
  const cookieStore = await cookies()
  const session = cookieStore.get('__session')?.value
  if (!session) return NextResponse.json({ error: '請先登入' }, { status: 401 })
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const role = (decoded as any).role
    if (!['super-admin', 'admin'].includes(role)) {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  try {
    const { audience, subject, content } = await req.json()

    if (!subject || !content) {
      return NextResponse.json({ error: '主旨與內容為必填' }, { status: 400 })
    }

    // Build Firestore query based on audience
    let query = adminDb.collection('customers').limit(2000) as FirebaseFirestore.Query
    if (audience === 'marketing') {
      query = query.where('marketingConsent', '==', true)
    } else if (audience === 'gold') {
      query = query.where('tier', '==', 'gold')
    } else if (audience === 'silver_and_above') {
      query = query.where('tier', 'in', ['silver', 'gold'])
    }

    const snap = await query.get()

    // Load SMTP settings from Firestore
    const settingsSnap = await adminDb.collection('settings').doc('site-settings').get()
    const emailSettings = (settingsSnap.data() as any)?.emailSettings ?? {}
    const fromAddress = emailSettings.fromAddress || process.env.EMAIL_FROM || 'noreply@asahihuuhu.com'
    const fromName = emailSettings.fromName || '朝日夫婦'

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST,
      port: Number(process.env.EMAIL_SMTP_PORT ?? 465),
      secure: process.env.EMAIL_SMTP_SECURE !== 'false',
      auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
      },
    })

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        ${content.replace(/\n/g, '<br>')}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;">
        <p style="font-size:12px;color:#9ca3af;text-align:center;">
          朝日夫婦 · 淡水河畔<br>
          如不希望收到此類郵件，請至會員中心取消訂閱
        </p>
      </div>
    `

    let sent = 0
    let failed = 0
    for (const doc of snap.docs) {
      const customer = doc.data()
      if (!customer.email) continue
      try {
        await transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to: customer.email,
          subject,
          html,
        })
        sent++
      } catch {
        failed++
      }
    }

    return NextResponse.json({ ok: true, sent, failed, total: snap.size })
  } catch (err: any) {
    console.error('send-marketing-email error:', err)
    return NextResponse.json({ error: err.message ?? '發送失敗' }, { status: 500 })
  }
}
