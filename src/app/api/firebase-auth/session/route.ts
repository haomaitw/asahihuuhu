import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase/admin'

const SESSION_DAYS = 5
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()
    if (!idToken) return NextResponse.json({ error: 'idToken required' }, { status: 400 })

    const decoded = await adminAuth.verifyIdToken(idToken)
    const role = (decoded as any).role as string | undefined
    if (!role || !['super-admin', 'admin', 'staff'].includes(role)) {
      return NextResponse.json({ error: '無後台存取權限' }, { status: 403 })
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MS })

    const cookieStore = await cookies()
    cookieStore.set('__session', sessionCookie, {
      maxAge: SESSION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json({ ok: true, role })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed' }, { status: 500 })
  }
}
