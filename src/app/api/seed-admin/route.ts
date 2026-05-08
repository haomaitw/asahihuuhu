/**
 * POST /api/seed-admin
 *
 * 建立或重設管理員帳號。受 PAYLOAD_SECRET 保護。
 *
 * Body:
 *   {
 *     "secret": "<PAYLOAD_SECRET>",
 *     "email": "admin@example.com",
 *     "password": "your-new-password",
 *     "name": "Admin"          // 可選
 *   }
 *
 * - 若該 email 已存在 → 重設密碼
 * - 若不存在 → 建立新管理員
 *
 * 設定完成後建議從 Zeabur 環境變數刪除此路由（或直接在 Zeabur 不開放）。
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

    // 搜尋現有帳號
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      // 重設密碼
      const user = existing.docs[0] as any
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          password,
          ...(name ? { name } : {}),
        },
        overrideAccess: true,
      })
      return NextResponse.json({
        ok: true,
        action: 'updated',
        message: `已重設 ${email} 的密碼`,
      })
    }

    // 建立新管理員
    const created = await payload.create({
      collection: 'users',
      data: {
        email: email.toLowerCase().trim(),
        password,
        name: name ?? '管理員',
        role: 'admin',
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      ok: true,
      action: 'created',
      message: `已建立管理員帳號 ${email}`,
      id: created.id,
    })
  } catch (err: any) {
    console.error('[seed-admin]', err)
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 },
    )
  }
}
