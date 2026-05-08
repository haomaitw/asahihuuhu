/**
 * POST /api/seed-admin
 *
 * 建立或重設管理員帳號。受 PAYLOAD_SECRET 保護。
 *
 * Body: { "secret": "...", "email": "...", "password": "...", "name": "..." }
 *
 * - 若該 email 已存在 → 用 forgotPassword + resetPassword 確保密碼正確 hash
 * - 若不存在 → 建立新管理員
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

    // 搜尋現有帳號
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: normalEmail } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      const user = existing.docs[0] as any

      // 使用 forgotPassword + resetPassword 確保密碼正確 hash
      // disableEmail: true → 不發信，直接拿 token
      const fpResult = await payload.forgotPassword({
        collection: 'users',
        data: { email: normalEmail },
        disableEmail: true,
      }) as any

      const token = fpResult?.token ?? fpResult

      if (!token) {
        // fallback: 直接 update（某些版本 forgotPassword 不回傳 token）
        await payload.update({
          collection: 'users',
          id: user.id,
          data: { password, ...(name ? { name } : {}) },
          overrideAccess: true,
        })
        return NextResponse.json({
          ok: true,
          action: 'updated_fallback',
          message: `已重設 ${normalEmail} 的密碼（fallback）`,
          foundEmail: user.email,
        })
      }

      await payload.resetPassword({
        collection: 'users',
        data: { token, password },
        overrideAccess: true,
      })

      if (name) {
        await payload.update({
          collection: 'users',
          id: user.id,
          data: { name },
          overrideAccess: true,
        })
      }

      return NextResponse.json({
        ok: true,
        action: 'updated',
        message: `已重設 ${normalEmail} 的密碼`,
        foundEmail: user.email,
      })
    }

    // 建立新管理員
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
      action: 'created',
      message: `已建立管理員帳號 ${normalEmail}`,
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
