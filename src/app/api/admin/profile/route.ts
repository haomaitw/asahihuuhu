import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

/**
 * GET /api/admin/profile
 * Return the current user's own profile from Firestore.
 */
export async function GET() {
  const user = await verifyAdminSession()
  if (!user) return NextResponse.json({ error: '請先登入' }, { status: 401 })

  try {
    const doc = await adminDb.collection('users').doc(user.uid).get()
    const data = doc.exists ? (doc.data() as any) : {}
    return NextResponse.json({
      id:    user.uid,
      email: user.email ?? null,
      name:  data.name ?? null,
      role:  data.role ?? user.role,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/profile
 * Allow any logged-in user to update their own name and/or password.
 */
export async function PATCH(req: NextRequest) {
  const user = await verifyAdminSession()
  if (!user) return NextResponse.json({ error: '請先登入' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, password } = body

    if (password && password.length < 8) {
      return NextResponse.json({ error: '密碼長度至少 8 個字元' }, { status: 400 })
    }

    // Update Firebase Auth
    const authUpdate: Record<string, any> = {}
    if (name !== undefined) authUpdate.displayName = name
    if (password) authUpdate.password = password
    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(user.uid, authUpdate)
    }

    // Update Firestore doc
    const fsUpdate: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (name !== undefined) fsUpdate.name = name
    await adminDb.collection('users').doc(user.uid).set(fsUpdate, { merge: true })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '更新失敗，請稍後再試' }, { status: 500 })
  }
}
