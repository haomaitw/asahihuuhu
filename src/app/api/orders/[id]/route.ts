import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminDb, adminAuth } from '@/lib/firebase/admin'
import { sendShippingNotification } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const session = cookieStore.get('__session')?.value
    if (!session) return NextResponse.json({ error: '無權限' }, { status: 403 })
    try {
      const decoded = await adminAuth.verifySessionCookie(session, true)
      const role = (decoded as any).role
      if (!['super-admin', 'admin', 'staff'].includes(role)) {
        return NextResponse.json({ error: '無權限' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    const body = await req.json()
    const { status, fulfillmentStatus, trackingNumber, adminNote } = body

    const orderRef = adminDb.collection('orders').doc(id)
    const existingSnap = await orderRef.get()
    if (!existingSnap.exists) return NextResponse.json({ error: '找不到訂單' }, { status: 404 })
    const existing = existingSnap.data() as any

    const updateData: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (status !== undefined) updateData.status = status
    if (fulfillmentStatus !== undefined) updateData.fulfillmentStatus = fulfillmentStatus
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (adminNote !== undefined) updateData.adminNote = adminNote

    await orderRef.update(updateData)

    // Send shipping notification when order becomes 'shipped'
    if (existing.fulfillmentStatus !== 'shipped' && fulfillmentStatus === 'shipped' && existing.customerEmail) {
      sendShippingNotification({
        orderNumber: existing.orderNumber,
        customerName: existing.customerName ?? '顧客',
        customerEmail: existing.customerEmail,
        trackingNumber: trackingNumber ?? existing.trackingNumber,
        tcatOrderNo: existing.tcatOrderNo,
        shippingAddress: existing.shippingAddress ?? {},
      }).catch((e) => console.error('[email] shipping notification failed:', e))
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[api/orders/[id] PATCH]', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
