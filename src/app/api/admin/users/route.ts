import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

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

/**
 * POST /api/admin/users — create a new admin or staff account
 * super-admin can create any role
 * admin can only create staff
 */
export async function POST(req: NextRequest) {
  const { payload, user } = await getAuthUser()

  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, password, role } = body

  if (!email || !password) {
    return NextResponse.json({ error: '請填寫 Email 和密碼' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: '密碼長度至少 8 個字元' }, { status: 400 })
  }

  // admin can only create staff; super-admin can create any role
  const allowedRoles: string[] =
    user.role === 'super-admin'
      ? ['super-admin', 'admin', 'staff']
      : ['staff']

  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: '您沒有權限建立此角色的帳號' }, { status: 403 })
  }

  try {
    const doc = await payload.create({
      collection: 'users',
      data: { name, email, password, role: role ?? 'staff' },
      overrideAccess: true,
    })
    return NextResponse.json({ ok: true, doc })
  } catch (err: any) {
    const msg = err?.message ?? 'Server error'
    const isDuplicate = msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')
    return NextResponse.json(
      { error: isDuplicate ? '此 Email 已被使用' : msg },
      { status: 400 },
    )
  }
}

/**
 * GET /api/admin/users — list users
 * super-admin sees all; admin sees only staff they manage
 */
export async function GET() {
  const { payload, user } = await getAuthUser()

  if (!user || user.collection !== 'users') {
    return NextResponse.json({ error: '請先登入' }, { status: 401 })
  }

  const where =
    user.role === 'super-admin'
      ? undefined
      : { role: { equals: 'staff' } }

  const { docs } = await payload.find({
    collection: 'users',
    where,
    limit: 100,
    sort: '-createdAt',
    overrideAccess: true,
  })

  return NextResponse.json({ docs })
}
