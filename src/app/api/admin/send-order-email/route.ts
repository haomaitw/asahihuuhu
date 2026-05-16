import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { sendShippingNotification, sendOrderMessage } from '@/lib/email'

export async function POST(req: NextRequest) {
  // Verify Firebase session
  const cookieStore = await cookies()
  const session = cookieStore.get('__session')?.value
  if (!session) return NextResponse.json({ error: '請先登入' }, { status: 401 })
  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const role = (decoded as any).role
    if (!['super-admin', 'admin', 'staff'].includes(role)) {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const body = await req.json()
  const { type, orderId, subject, message } = body

  if (!orderId || !type) {
    return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
  }

  const orderSnap = await adminDb.collection('orders').doc(orderId).get()
  if (!orderSnap.exists) {
    return NextResponse.json({ error: '找不到訂單' }, { status: 404 })
  }
  const order = orderSnap.data() as any

  if (!order.customerEmail) {
    return NextResponse.json({ error: '此訂單沒有顧客 Email' }, { status: 400 })
  }

  try {
    if (type === 'shipping') {
      await sendShippingNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName ?? '顧客',
        customerEmail: order.customerEmail,
        trackingNumber: order.trackingNumber,
        tcatOrderNo: order.tcatOrderNo,
        shippingAddress: order.shippingAddress ?? {},
      })
      return NextResponse.json({ ok: true, message: '出貨通知已發送' })
    }

    if (type === 'message') {
      if (!subject?.trim() || !message?.trim()) {
        return NextResponse.json({ error: '請填寫主旨和訊息內容' }, { status: 400 })
      }
      await sendOrderMessage({
        orderNumber: order.orderNumber,
        customerName: order.customerName ?? '顧客',
        customerEmail: order.customerEmail,
        subject: subject.trim(),
        message: message.trim(),
      })
      return NextResponse.json({ ok: true, message: '訊息已發送' })
    }

    return NextResponse.json({ error: '不支援的 email 類型' }, { status: 400 })
  } catch (err: any) {
    console.error('[admin/send-order-email]', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
