import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { sendShippingNotification } from '@/lib/email'

type Params = { params: Promise<{ id: string }> }

/**
 * PATCH /api/orders/[id]
 * Update order status, fulfillmentStatus, trackingNumber, adminNote.
 * Admin (users collection) only.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const headersList = await headers()
    const payload = await getPayload({ config: configPromise })

    // Auth check
    let currentUser: any = null
    try {
      const { user } = await payload.auth({ headers: headersList })
      currentUser = user
    } catch {}

    if (!currentUser || currentUser.collection !== 'users') {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    const body = await req.json()
    const { status, fulfillmentStatus, trackingNumber, adminNote } = body

    // Fetch current order to detect status changes
    const existing = await payload.findByID({
      collection: 'orders',
      id,
      overrideAccess: true,
    }) as any

    const updateData: Record<string, any> = {}
    if (status !== undefined) updateData.status = status
    if (fulfillmentStatus !== undefined) updateData.fulfillmentStatus = fulfillmentStatus
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (adminNote !== undefined) updateData.adminNote = adminNote

    const updated = await payload.update({
      collection: 'orders',
      id,
      data: updateData,
      overrideAccess: true,
    })

    // Send shipping notification email when order transitions to 'shipped'
    const wasNotShipped = existing?.fulfillmentStatus !== 'shipped'
    const isNowShipped = fulfillmentStatus === 'shipped'
    if (wasNotShipped && isNowShipped && existing?.customerEmail) {
      sendShippingNotification({
        orderNumber: existing.orderNumber,
        customerName: existing.customerName ?? '顧客',
        customerEmail: existing.customerEmail,
        trackingNumber: trackingNumber ?? existing.trackingNumber,
        tcatOrderNo: existing.tcatOrderNo,
        shippingAddress: existing.shippingAddress ?? {},
      }).catch((e) => console.error('[email] shipping notification failed:', e))
    }

    return NextResponse.json({ ok: true, doc: updated })
  } catch (err: any) {
    console.error('[api/orders/[id] PATCH]', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
