/**
 * POST /api/seed-admin
 *
 * action: "clear"  → 刪除所有 users，讓 Payload 顯示「建立第一位使用者」頁面
 * action: "create" → 建立帳號並立即驗證登入（預設）
 *
 * Body: { "secret": "...", "action": "clear"|"create", "email": "...", "password": "..." }
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

    // ── action: create ────────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json({ error: 'email 與 password 為必填' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'password 至少需要 8 個字元' }, { status: 400 })
    }

    const normalEmail = email.toLowerCase().trim()

    // 刪除現有同 email 帳號
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

    // 建立新帳號
    await payload.create({
      collection: 'users',
      data: { email: normalEmail, password, name: name ?? '管理員', role: 'admin' },
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
        ? `✅ 成功，請至 /admin/login 用 ${normalEmail} 登入`
        : `⚠️ 帳號建立但驗證失敗：${loginError}`,
    })
  } catch (err: any) {
    console.error('[seed-admin]', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
