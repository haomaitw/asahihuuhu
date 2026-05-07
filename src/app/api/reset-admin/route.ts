import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// TEMPORARY — re-hashes the super-admin password.
// Delete this file after successfully logging in.
export async function POST(request: Request) {
  try {
    const { secret, password } = await request.json()

    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const users = await payload.find({
      collection: 'users',
      limit: 1,
      overrideAccess: true,
    })

    if (users.totalDocs === 0) {
      // No users exist at all — create fresh
      const user = await payload.create({
        collection: 'users',
        data: {
          email: 'howardkoka@gmail.com',
          password,
          name: 'Howard',
          role: 'super-admin',
        },
        overrideAccess: true,
      })
      return NextResponse.json({ ok: true, action: 'created', email: user.email })
    }

    // User exists — update password (triggers Payload's hash+salt hooks)
    const userId = users.docs[0].id
    const email = (users.docs[0] as any).email

    await payload.update({
      collection: 'users',
      id: userId,
      data: { password },
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true, action: 'password_reset', email })
  } catch (err: any) {
    console.error('[reset-admin] Error:', err)
    return NextResponse.json({ error: err?.message ?? String(err), stack: err?.stack?.split('\n').slice(0, 5) }, { status: 500 })
  }
}
