import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

type Params = { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/users/[id]
 * Update a Firebase Auth user's display name and/or custom-claim role.
 * Restrictions:
 *   - admin cannot modify super-admin accounts.
 *   - admin can only assign the 'staff' role.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const caller = await verifyAdminSession(['super-admin', 'admin'])
  if (!caller) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Fetch the target user to check their current role
    const target = await adminAuth.getUser(id)
    const targetRole: string | undefined = (target.customClaims as any)?.role

    // admin cannot modify super-admin accounts
    if (caller.role !== 'super-admin' && targetRole === 'super-admin') {
      return NextResponse.json({ error: '您沒有權限編輯此帳號' }, { status: 403 })
    }

    const body = await req.json()
    const { displayName, role } = body

    // Validate desired role assignment
    if (role !== undefined) {
      const assignableRoles: string[] =
        caller.role === 'super-admin' ? ['super-admin', 'admin', 'staff'] : ['staff']
      if (!assignableRoles.includes(role)) {
        return NextResponse.json({ error: '您沒有權限設定此角色' }, { status: 403 })
      }
    }

    // Build Auth update payload
    const authUpdate: Record<string, any> = {}
    if (displayName !== undefined) authUpdate.displayName = displayName

    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(id, authUpdate)
    }

    // Update custom claims if a new role is provided
    const currentClaims = (target.customClaims as Record<string, any>) ?? {}
    if (role !== undefined) {
      await adminAuth.setCustomUserClaims(id, { ...currentClaims, role })
    }

    const updated = await adminAuth.getUser(id)
    return NextResponse.json({
      ok: true,
      doc: {
        uid: updated.uid,
        email: updated.email ?? null,
        displayName: updated.displayName ?? null,
        role: (updated.customClaims as any)?.role ?? null,
        disabled: updated.disabled,
      },
    })
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a Firebase Auth user.
 * Restrictions:
 *   - Cannot delete your own account.
 *   - admin cannot delete super-admin accounts.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const caller = await verifyAdminSession(['super-admin', 'admin'])
  if (!caller) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  // Cannot delete own account
  if (caller.uid === id) {
    return NextResponse.json({ error: '無法刪除目前登入的帳號' }, { status: 400 })
  }

  try {
    const target = await adminAuth.getUser(id)
    const targetRole: string | undefined = (target.customClaims as any)?.role

    // admin cannot delete super-admin accounts
    if (caller.role !== 'super-admin' && targetRole === 'super-admin') {
      return NextResponse.json({ error: '您沒有權限刪除此帳號' }, { status: 403 })
    }

    await adminAuth.deleteUser(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
