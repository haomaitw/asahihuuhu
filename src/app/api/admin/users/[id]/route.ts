import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

type Params = { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/users/[id]
 * Update name, role, and/or password.
 * Syncs both Firebase Auth and Firestore users doc (source of truth).
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const caller = await verifyAdminSession(['super-admin', 'admin'])
  if (!caller) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  try {
    // Read target role from Firestore (source of truth)
    let targetRole: string | undefined
    try {
      const targetDoc = await adminDb.collection('users').doc(id).get()
      if (targetDoc.exists) targetRole = (targetDoc.data() as any)?.role
    } catch {}

    // Fallback to Firebase Auth custom claims
    if (!targetRole) {
      try {
        const authUser = await adminAuth.getUser(id)
        targetRole = (authUser.customClaims as any)?.role
      } catch {}
    }

    // admin cannot modify super-admin accounts
    if (caller.role !== 'super-admin' && targetRole === 'super-admin') {
      return NextResponse.json({ error: '您沒有權限編輯此帳號' }, { status: 403 })
    }

    const body = await req.json()
    const { name, role, password } = body

    // Validate role assignment
    if (role !== undefined) {
      const assignableRoles: string[] =
        caller.role === 'super-admin' ? ['super-admin', 'admin', 'staff'] : ['staff']
      if (!assignableRoles.includes(role)) {
        return NextResponse.json({ error: '您沒有權限設定此角色' }, { status: 403 })
      }
    }

    // Update Firebase Auth (displayName + optional password)
    const authUpdate: Record<string, any> = {}
    if (name !== undefined) authUpdate.displayName = name
    if (password) authUpdate.password = password
    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(id, authUpdate)
    }

    // Update custom claims if role changed
    if (role !== undefined) {
      const authUser = await adminAuth.getUser(id)
      const currentClaims = (authUser.customClaims as Record<string, any>) ?? {}
      await adminAuth.setCustomUserClaims(id, { ...currentClaims, role })
    }

    // Update Firestore doc (source of truth for role + name)
    const firestoreUpdate: Record<string, any> = { updatedAt: new Date().toISOString() }
    if (name !== undefined) firestoreUpdate.name = name
    if (role !== undefined) firestoreUpdate.role = role
    await adminDb.collection('users').doc(id).set(firestoreUpdate, { merge: true })

    // Return updated Firestore doc
    const updatedDoc = await adminDb.collection('users').doc(id).get()
    const docData = (updatedDoc.exists ? updatedDoc.data() : {}) as any
    return NextResponse.json({
      ok: true,
      doc: {
        id,
        email: docData.email ?? null,
        name: docData.name ?? null,
        role: docData.role ?? null,
      },
    })
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: '更新失敗，請稍後再試' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete from Firebase Auth + Firestore.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const caller = await verifyAdminSession(['super-admin', 'admin'])
  if (!caller) {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  if (caller.uid === id) {
    return NextResponse.json({ error: '無法刪除目前登入的帳號' }, { status: 400 })
  }

  try {
    // Read target role from Firestore
    let targetRole: string | undefined
    try {
      const targetDoc = await adminDb.collection('users').doc(id).get()
      if (targetDoc.exists) targetRole = (targetDoc.data() as any)?.role
    } catch {}

    if (!targetRole) {
      try {
        const authUser = await adminAuth.getUser(id)
        targetRole = (authUser.customClaims as any)?.role
      } catch {}
    }

    if (caller.role !== 'super-admin' && targetRole === 'super-admin') {
      return NextResponse.json({ error: '您沒有權限刪除此帳號' }, { status: 403 })
    }

    await Promise.all([
      adminAuth.deleteUser(id).catch(() => {}),
      adminDb.collection('users').doc(id).delete().catch(() => {}),
    ])

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err?.code === 'auth/user-not-found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: '刪除失敗，請稍後再試' }, { status: 500 })
  }
}
