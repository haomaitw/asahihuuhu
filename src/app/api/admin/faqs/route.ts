import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

/**
 * GET /api/admin/faqs
 * List FAQ items ordered by createdAt desc.
 */
export async function GET() {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('faqs').orderBy('createdAt', 'desc').get()
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/faqs
 * Create a FAQ item. Requires super-admin or admin.
 */
export async function POST(req: NextRequest) {
  const user = await verifyAdminSession(['super-admin', 'admin'])
  if (!user) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const now = new Date().toISOString()
    const ref = await adminDb.collection('faqs').add({ ...body, createdAt: now, updatedAt: now })
    const created = await ref.get()
    return NextResponse.json({ ok: true, doc: { id: created.id, ...created.data() } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
