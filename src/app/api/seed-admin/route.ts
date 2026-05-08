/**
 * POST /api/seed-admin
 * 建立或重設管理員帳號（受 PAYLOAD_SECRET 保護）
 *
 * Body: { "secret": "...", "email": "...", "password": "...", "name": "..." }
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { secret, email, password, name } = body ?? {}

    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!email || !password) {
      return NextResponse.json({ error: 'email 與 password 為必填' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'password 至少需要 8 個字元' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const normalEmail = email.toLowerCase().trim()

    // 找出現有帳號並刪除（讓 create 重建，確保密碼正確 hash）
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: normalEmail } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      const user = existing.docs[0] as any
      await payload.delete({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
      })
    }

    // 重新建立（payload.create 的密碼一定會正確 hash）
    const created = await payload.create({
      collection: 'users',
      data: {
        email: normalEmail,
        password,
        name: name ?? '管理員',
        role: 'admin',
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      message: `帳號 ${normalEmail} 已建立，請至 /admin/login 登入`,
      id: created.id,
    })
  } catch (err: any) {
    console.error('[seed-admin]', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
