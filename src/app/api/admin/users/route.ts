import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

/**
 * GET /api/admin/users
 * List users from Firestore (source of truth for role+name).
 * super-admin sees all; admin sees only staff.
 */
export async function GET() {
  const user = await verifyAdminSession(['super-admin', 'admin'])
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  try {
    let snap
    if (user.role === 'super-admin') {
      snap = await adminDb.collection('users').limit(200).get()
    } else {
      snap = await adminDb.collection('users').where('role', '==', 'staff').limit(200).get()
    }

    const docs = snap.docs
      .map((d) => {
        const data = d.data()
        return {
          id: d.id,
          name: data.name ?? null,
          email: data.email ?? '',
          role: data.role ?? null,
          createdAt: data.createdAt ? String(data.createdAt) : undefined,
        }
      })
      .sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return b.createdAt.localeCompare(a.createdAt)
      })

    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/users
 * Create a new Firebase Auth user + Firestore users doc.
 * super-admin can create any role; admin can only create staff.
 */
export async function POST(req: NextRequest) {
  const caller = await verifyAdminSession(['super-admin', 'admin'])
  if (!caller) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const body = await req.json()
  const { email, password, name, role } = body

  if (!email || !password) {
    return NextResponse.json({ error: '請填寫 Email 和密碼' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: '密碼長度至少 8 個字元' }, { status: 400 })
  }

  const creatableRoles: string[] =
    caller.role === 'super-admin' ? ['super-admin', 'admin', 'staff'] : ['staff']

  const targetRole: string = role ?? 'staff'
  if (!creatableRoles.includes(targetRole)) {
    return NextResponse.json({ error: '您沒有權限建立此角色的帳號' }, { status: 403 })
  }

  try {
    const newUser = await adminAuth.createUser({
      email,
      password,
      displayName: name ?? '',
    })
    await adminAuth.setCustomUserClaims(newUser.uid, { role: targetRole })

    const now = new Date().toISOString()
    await adminDb.collection('users').doc(newUser.uid).set({
      email,
      name: name ?? null,
      role: targetRole,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json(
      {
        ok: true,
        doc: {
          id: newUser.uid,
          email: newUser.email ?? null,
          name: name ?? null,
          role: targetRole,
          createdAt: now,
        },
      },
      { status: 201 },
    )
  } catch (err: any) {
    const isDuplicate =
      err?.code === 'auth/email-already-exists' ||
      (err?.message ?? '').toLowerCase().includes('email already exists')
    return NextResponse.json(
      { error: isDuplicate ? '此 Email 已被使用' : '建立失敗' },
      { status: 400 },
    )
  }
}
