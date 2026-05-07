import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// TEMP: show admin emails + reset password. DELETE after use.
export async function POST(request: Request) {
  try {
    const { secret, newPassword } = await request.json()
    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // List all users
    const users = await payload.find({
      collection: 'users',
      limit: 10,
      overrideAccess: true,
    })

    const emails = users.docs.map((u: any) => ({ id: u.id, email: u.email, role: u.role }))

    // If newPassword provided, reset first user's password
    if (newPassword && newPassword.length >= 8 && users.docs.length > 0) {
      const userId = users.docs[0].id
      await payload.update({
        collection: 'users',
        id: userId,
        data: { password: newPassword },
        overrideAccess: true,
      })
      return NextResponse.json({
        ok: true,
        users: emails,
        resetEmail: (users.docs[0] as any).email,
        action: 'password_reset',
      })
    }

    return NextResponse.json({ ok: true, users: emails })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 },
    )
  }
}
