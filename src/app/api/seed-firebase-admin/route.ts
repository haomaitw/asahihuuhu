/**
 * POST /api/seed-firebase-admin
 *
 * action: "create"  → create a Firebase Auth user + set custom claim role: "super-admin"
 * action: "promote" → set custom claim role: "super-admin" on existing user by email
 * action: "clear"   → delete ALL Firebase Auth users (use with caution!)
 *
 * Body: { secret, action, email, password, name, role }
 */
import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { secret, action = 'create', email, password, name, role = 'super-admin' } = body ?? {}

    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'clear') {
      const list = await adminAuth.listUsers(1000)
      await Promise.all(list.users.map(u => adminAuth.deleteUser(u.uid)))
      return NextResponse.json({ ok: true, deleted: list.users.length })
    }

    if (action === 'promote') {
      if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
      const user = await adminAuth.getUserByEmail(email)
      await adminAuth.setCustomUserClaims(user.uid, { role: role })
      return NextResponse.json({ ok: true, message: `${email} promoted to ${role}` })
    }

    // action: create
    if (!email || !password) {
      return NextResponse.json({ error: 'email and password required' }, { status: 400 })
    }

    let uid: string
    try {
      const existing = await adminAuth.getUserByEmail(email)
      uid = existing.uid
      await adminAuth.updateUser(uid, { password, displayName: name ?? email })
    } catch {
      const created = await adminAuth.createUser({ email, password, displayName: name ?? email })
      uid = created.uid
    }

    await adminAuth.setCustomUserClaims(uid, { role })

    return NextResponse.json({
      ok: true,
      message: `✅ ${email} 已建立並設定為 ${role}，請至 /admin/login 登入`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 })
  }
}
