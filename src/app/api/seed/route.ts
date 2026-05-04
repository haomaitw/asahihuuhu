import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// ONE-TIME seed route — creates the first super-admin user
// DELETE this file after first user is created
export async function POST(request: Request) {
  const payload = await getPayload({ config })

  // Safety: only works if NO users exist yet
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
  })

  if (existing.totalDocs > 0) {
    return NextResponse.json(
      { error: 'Users already exist. Seed is disabled.' },
      { status: 403 }
    )
  }

  const { email, password, name } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  const user = await payload.create({
    collection: 'users',
    data: {
      email,
      password,
      name: name ?? 'Admin',
      role: 'super-admin',
    },
    overrideAccess: true,
  })

  return NextResponse.json({ ok: true, id: user.id, email: user.email, role: user.role })
}
