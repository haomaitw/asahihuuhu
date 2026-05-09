import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

type Params = { params: Promise<{ id: string }> }

async function getAuthUser() {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })
  try {
    const { user } = await payload.auth({ headers: headersList })
    return { payload, user }
  } catch {
    return { payload, user: null }
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { payload, user } = await getAuthUser()

  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const body = await req.json()
  const { name, role, password } = body

  // Fetch target user to check permission
  const target = await payload.findByID({ collection: 'users', id, overrideAccess: true }) as any

  // admin can only manage staff; super-admin can manage anyone
  if (user.role !== 'super-admin' && target?.role !== 'staff') {
    return NextResponse.json({ error: '您沒有權限編輯此帳號' }, { status: 403 })
  }

  const allowedRoles: string[] =
    user.role === 'super-admin' ? ['super-admin', 'admin', 'staff'] : ['staff']

  if (role && !allowedRoles.includes(role)) {
    return NextResponse.json({ error: '您沒有權限設定此角色' }, { status: 403 })
  }

  const data: Record<string, any> = {}
  if (name !== undefined) data.name = name
  if (role !== undefined) data.role = role
  if (password) {
    if (password.length < 8) return NextResponse.json({ error: '密碼長度至少 8 個字元' }, { status: 400 })
    data.password = password
  }

  try {
    const doc = await payload.update({ collection: 'users', id, data, overrideAccess: true })
    return NextResponse.json({ ok: true, doc })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { payload, user } = await getAuthUser()

  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  // Cannot delete yourself
  if (String(user.id) === String(id)) {
    return NextResponse.json({ error: '無法刪除目前登入的帳號' }, { status: 400 })
  }

  const target = await payload.findByID({ collection: 'users', id, overrideAccess: true }) as any

  // admin can only delete staff
  if (user.role !== 'super-admin' && target?.role !== 'staff') {
    return NextResponse.json({ error: '您沒有權限刪除此帳號' }, { status: 403 })
  }

  try {
    await payload.delete({ collection: 'users', id, overrideAccess: true })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
