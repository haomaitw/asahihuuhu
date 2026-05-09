import { NextRequest, NextResponse } from 'next/server'
import { sendAdminNotification } from '@/lib/email'

/**
 * POST /api/notify-stock
 * Body: { productId, productName, email }
 *
 * Public endpoint — no auth required.
 * Sends an admin notification email so the team knows someone is waiting for restock.
 * (A full waitlist DB could be wired in later.)
 */
export async function POST(req: NextRequest) {
  try {
    const { productId, productName, email } = await req.json()

    if (!email || !productId) {
      return NextResponse.json({ error: '缺少必要資訊' }, { status: 400 })
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email 格式不正確' }, { status: 400 })
    }

    await sendAdminNotification(
      `補貨通知請求：${productName ?? productId}`,
      `顧客 <strong>${email}</strong> 希望在商品補貨時收到通知。<br/><br/>商品：${productName ?? productId}<br/>商品ID：${productId}`
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[api/notify-stock]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
