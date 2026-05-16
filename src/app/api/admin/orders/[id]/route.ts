import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/orders/[id]
 * Get an order by Firestore document ID.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  try {
    const snap = await adminDb.collection('orders').doc(id).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ id: snap.id, ...snap.data() })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order fields such as fulfillmentStatus, trackingNumber, adminNote.
 * Accessible by any admin role.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    // Whitelist the fields that can be updated via this endpoint
    const { fulfillmentStatus, trackingNumber, adminNote, ...rest } = body
    const update: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (fulfillmentStatus !== undefined) update.fulfillmentStatus = fulfillmentStatus
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber
    if (adminNote !== undefined) update.adminNote = adminNote
    // Allow other fields to pass through for flexibility
    Object.assign(update, rest)

    const snap = await adminDb.collection('orders').doc(id).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await adminDb.collection('orders').doc(id).update(update)
    const updated = await adminDb.collection('orders').doc(id).get()
    return NextResponse.json({ ok: true, doc: { id: updated.id, ...updated.data() } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
