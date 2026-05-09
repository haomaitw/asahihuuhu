import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sendShippingNotification, sendOrderMessage } from '@/lib/email'

/**
 * POST /api/admin/send-order-email
 * Admin sends an email to a customer about their order.
 *
 * Body:
 *   type: 'shipping' | 'message'
 *   orderId: string
 *   subject?: string   (for 'message' type)
 *   message?: string   (for 'message' type)
 */
export async function POST(req: NextRequest) {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  let currentUser: any = null
  try {
    const { user } = await payload.auth({ headers: headersList })
    currentUser = user
  } catch {}

  if (!currentUser || currentUser.collection !== 'users') {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const body = await req.json()
  const { type, orderId, subject, message } = body

  if (!orderId || !type) {
    return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
  }

  const order = await payload.findByID({
    collection: 'orders',
    id: orderId,
    overrideAccess: true,
  }) as any

  if (!order) {
    return NextResponse.json({ error: '找不到訂單' }, { status: 404 })
  }

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
