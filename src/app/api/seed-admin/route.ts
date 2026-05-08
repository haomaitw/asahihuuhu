/**
 * POST /api/seed-admin
 *
 * action: "clear"   → 刪除所有 users（讓 Payload 重新建立第一位使用者）
 * action: "create"  → 建立帳號（預設 role: "super-admin"）
 * action: "promote" → 將現有帳號升級為 super-admin（不改密碼）
 *
 * Body: { "secret": "...", "action": "...", "email": "...", "password": "...", "name": "..." }
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { secret, action = 'create', email, password, name } = body ?? {}

    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // ── action: clear ─────────────────────────────────────────────────────────
    if (action === 'clear') {
      const all = await payload.find({ collection: 'users', limit: 100, overrideAccess: true })
      for (const u of all.docs) {
        await payload.delete({ collection: 'users', id: (u as any).id, overrideAccess: true })
      }
      return NextResponse.json({
        ok: true,
        deleted: all.docs.length,
        next: '請前往 /admin 使用 Payload 內建頁面建立第一位管理員',
      })
    }

    // ── action: promote ───────────────────────────────────────────────────────
    // 把指定 email 的帳號升級為 super-admin（不刪除、不改密碼）
    if (action === 'promote') {
      if (!email) {
        return NextResponse.json({ error: 'email 為必填' }, { status: 400 })
      }
      const normalEmail = (email as string).toLowerCase().trim()
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: normalEmail } },
        limit: 1,
        overrideAccess: true,
      })
      if (!existing.docs.length) {
        return NextResponse.json({ error: `找不到帳號 ${normalEmail}` }, { status: 404 })
      }
      const userId = (existing.docs[0] as any).id
      await payload.update({
        collection: 'users',
        id: userId,
        data: { role: 'super-admin' },
        overrideAccess: true,
      })
      return NextResponse.json({
        ok: true,
        message: `✅ ${normalEmail} 已升級為 super-admin，請重新登入後台`,
      })
    }

    // ── action: create ────────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json({ error: 'email 與 password 為必填' }, { status: 400 })
    }
    if ((password as string).length < 8) {
      return NextResponse.json({ error: 'password 至少需要 8 個字元' }, { status: 400 })
    }

    const normalEmail = (email as string).toLowerCase().trim()

    // 刪除現有同 email 帳號（重建）
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: normalEmail } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      await payload.delete({
        collection: 'users',
        id: (existing.docs[0] as any).id,
        overrideAccess: true,
      })
    }

    // 建立新帳號（預設 role: super-admin）
    await payload.create({
      collection: 'users',
      data: {
        email:    normalEmail,
        password,
        name:     name ?? '代管商',
        role:     'super-admin',    // ← changed from 'admin'
      },
      overrideAccess: true,
    })

    // 立即驗證
    let loginOk = false
    let loginError = ''
    try {
      const r = await payload.login({ collection: 'users', data: { email: normalEmail, password } }) as any
      loginOk = !!r?.user
    } catch (e: any) {
      loginError = e?.message ?? String(e)
    }

    return NextResponse.json({
      ok: true,
      loginOk,
      message: loginOk
        ? `✅ 成功（role: super-admin），請至 /admin/login 用 ${normalEmail} 登入`
        : `⚠️ 帳號建立但驗證失敗：${loginError}`,
    })
  } catch (err: any) {
    console.error('[seed-admin]', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
