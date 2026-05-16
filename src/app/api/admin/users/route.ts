import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

/**
 * GET /api/admin/users
 * List Firebase Auth users with their custom-claim roles.
 * super-admin sees all users; admin sees only staff accounts.
 */
export async function GET() {
  const user = await verifyAdminSession(['super-admin', 'admin'])
  if (!user) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  try {
    const listResult = await adminAuth.listUsers(1000)
    const docs = listResult.users
      .map((u) => ({
        uid: u.uid,
        email: u.email ?? null,
        displayName: u.displayName ?? null,
        role: (u.customClaims as any)?.role ?? null,
        disabled: u.disabled,
        createdAt: u.metadata.creationTime,
        lastSignIn: u.metadata.lastSignInTime ?? null,
      }))
      .filter((u) => {
        // admin only sees staff accounts
        if (user.role === 'super-admin') return true
        return u.role === 'staff'
      })

    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/users
 * Create a new Firebase Auth user and set their custom-claim role.
 * super-admin can create any role; admin can only create staff.
 */
export async function POST(req: NextRequest) {
  const caller = await verifyAdminSession(['super-admin', 'admin'])
  if (!caller) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const body = await req.json()
  const { email, password, displayName, role } = body

  if (!email || !password) {
    return NextResponse.json({ error: '請填寫 Email 和密碼' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: '密碼長度至少 8 個字元' }, { status: 400 })
  }

  // admin can only create staff; super-admin can create any role
  const creatableRoles: string[] =
    caller.role === 'super-admin' ? ['super-admin', 'admin', 'staff'] : ['staff']

  const targetRole: string = role ?? 'staff'
  if (!creatableRoles.includes(targetRole)) {
    return NextResponse.json({ error: '您沒有權限建立此角色的帳號' }, { status: 403 })
  }

  try {
    const newUser = await adminAuth.createUser({ email, password, displayName: displayName ?? '' })
    await adminAuth.setCustomUserClaims(newUser.uid, { role: targetRole })

    return NextResponse.json(
      {
        ok: true,
        doc: {
          uid: newUser.uid,
          email: newUser.email ?? null,
          displayName: newUser.displayName ?? null,
          role: targetRole,
        },
      },
      { status: 201 },
    )
  } catch (err: any) {
    const msg: string = err?.message ?? 'Server error'
    const isDuplicate =
      err?.code === 'auth/email-already-exists' || msg.toLowerCase().includes('email already exists')
    return NextResponse.json({ error: isDuplicate ? '此 Email 已被使用' : msg }, { status: 400 })
  }
}
