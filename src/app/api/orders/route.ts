import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminDb, adminAuth } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('__session')?.value

    let isAdmin = false
    if (session) {
      try {
        const decoded = await adminAuth.verifySessionCookie(session, true)
        const role = (decoded as any).role
        if (['super-admin', 'admin', 'staff'].includes(role)) isAdmin = true
      } catch {}
    }

    if (!isAdmin) {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    const snap = await adminDb.collection('orders').orderBy('createdAt', 'desc').limit(100).get()
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (err: any) {
    console.error('[api/orders]', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
