import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

/**
 * GET /api/admin/media
 * List media items from the `media` Firestore collection, ordered by createdAt desc.
 * Accessible by super-admin, admin, and staff.
 *
 * Note: file uploads are handled separately via Firebase Storage.
 */
export async function GET() {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('media').orderBy('createdAt', 'desc').get()
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
