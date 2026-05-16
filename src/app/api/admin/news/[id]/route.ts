import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/news/[id]
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  try {
    const snap = await adminDb.collection('news').doc(id).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ id: snap.id, ...snap.data() })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/news/[id]
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await verifyAdminSession(['super-admin', 'admin'])
  if (!user) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const snap = await adminDb.collection('news').doc(id).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await adminDb.collection('news').doc(id).update({ ...body, updatedAt: new Date().toISOString() })
    const updated = await adminDb.collection('news').doc(id).get()
    return NextResponse.json({ ok: true, doc: { id: updated.id, ...updated.data() } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/news/[id]
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await verifyAdminSession(['super-admin', 'admin'])
  if (!user) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 })
  }

  const { id } = await params

  try {
    const snap = await adminDb.collection('news').doc(id).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await adminDb.collection('news').doc(id).delete()
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
