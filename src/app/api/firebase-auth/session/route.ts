import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

const SESSION_DAYS = 5
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000
const ALLOWED_ROLES = ['super-admin', 'admin', 'staff']

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const idToken = body?.idToken
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 })
    }

    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    // Firestore is the source of truth for role
    let role: string | undefined
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get()
      if (userDoc.exists) {
        role = (userDoc.data() as any)?.role
      }
    } catch {
      // Firestore unavailable — fall back to claims
    }

    if (!role) role = (decoded as any).role as string | undefined

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: '無後台存取權限' }, { status: 403 })
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MS })

    const cookieStore = await cookies()
    cookieStore.set('__session', sessionCookie, {
      maxAge: SESSION_MS / 1000,
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'strict',
    })

    return NextResponse.json({ ok: true, role })
  } catch {
    return NextResponse.json({ error: '登入失敗，請稍後再試' }, { status: 500 })
  }
}
