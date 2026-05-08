/**
 * POST /api/seed-admin  → 建立管理員帳號並立即驗證登入
 * DELETE /api/seed-admin → 清空所有 users（讓 Payload 顯示建立第一位使用者頁面）
 *
 * 兩個動作都需要 query: ?secret=<PAYLOAD_SECRET>
 */
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

function checkSecret(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret')
  return secret === process.env.PAYLOAD_SECRET
}

// ── DELETE：清空所有 admin users ──────────────────────────────────────────────
export async function DELETE(request: Request) {
  if (!checkSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const payload = await getPayload({ config })
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

// ── POST：建立帳號並立即驗證 ──────────────────────────────────────────────────
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

    // ← 立即用 payload.login() 驗證密碼是否正確設定
    let loginOk = false
    let loginError = ''
    try {
      const loginResult = await payload.login({
        collection: 'users',
        data: { email: normalEmail, password },
      }) as any
      loginOk = !!loginResult?.user
    } catch (e: any) {
      loginError = e?.message ?? String(e)
    }

    return NextResponse.json({
      ok: true,
      loginOk,
      loginError: loginError || undefined,
      message: loginOk
        ? `✅ 帳號建立成功，登入驗證通過。請至 /admin/login 登入`
        : `⚠️ 帳號建立但登入驗證失敗：${loginError}`,
    })
  } catch (err: any) {
    console.error('[seed-admin]', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
