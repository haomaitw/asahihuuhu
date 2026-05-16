import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

type Params = { params: Promise<{ slug: string }> }

/**
 * Slugs that require super-admin access for writes.
 * All other slugs can be written by admin+.
 */
const SUPER_ADMIN_ONLY_SLUGS = ['feature-flags']

/**
 * GET /api/admin/globals/[slug]
 * Retrieve a settings document at settings/{slug}.
 * Accessible by any admin role.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { slug } = await params

  try {
    const snap = await adminDb.collection('settings').doc(slug).get()
    if (!snap.exists) {
      return NextResponse.json({})
    }
    return NextResponse.json({ id: snap.id, ...snap.data() })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/globals/[slug]
 * Full replacement of a settings document. Sets updatedAt timestamp.
 * System slugs (e.g. feature-flags) require super-admin.
 * Content slugs require admin+.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const { slug } = await params

  const allowedRoles = SUPER_ADMIN_ONLY_SLUGS.includes(slug)
    ? ['super-admin']
    : ['super-admin', 'admin']

  const user = await verifyAdminSession(allowedRoles)
  if (!user) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const now = new Date().toISOString()
    await adminDb.collection('settings').doc(slug).set({ ...body, updatedAt: now }, { merge: false })
    const updated = await adminDb.collection('settings').doc(slug).get()
    return NextResponse.json({ ok: true, doc: { id: updated.id, ...updated.data() } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/globals/[slug]
 * Partial update of a settings document. Sets updatedAt timestamp.
 * System slugs (e.g. feature-flags) require super-admin.
 * Content slugs require admin+.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { slug } = await params

  const allowedRoles = SUPER_ADMIN_ONLY_SLUGS.includes(slug)
    ? ['super-admin']
    : ['super-admin', 'admin']

  const user = await verifyAdminSession(allowedRoles)
  if (!user) {
    return NextResponse.json({ error: '權限不足' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const now = new Date().toISOString()
    // Use set with merge:true so the document is created if it doesn't exist yet
    await adminDb.collection('settings').doc(slug).set({ ...body, updatedAt: now }, { merge: true })
    const updated = await adminDb.collection('settings').doc(slug).get()
    return NextResponse.json({ ok: true, doc: { id: updated.id, ...updated.data() } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
