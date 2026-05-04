import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URI_SET: !!process.env.POSTGRES_URI,
    POSTGRES_URI_PREFIX: process.env.POSTGRES_URI
      ? process.env.POSTGRES_URI.replace(/:([^@]+)@/, ':***@').slice(0, 40) + '...'
      : 'NOT SET',
    PAYLOAD_SECRET_SET: !!process.env.PAYLOAD_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  }

  try {
    const payload = await getPayload({ config })

    // Check users in DB
    const users = await payload.find({
      collection: 'users',
      limit: 10,
      overrideAccess: true,
    })

    // Check DB columns via raw query
    let columns: string[] = []
    try {
      const db = (payload.db as any)
      const result = await db.pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY column_name`
      )
      columns = result.rows.map((r: any) => r.column_name)
    } catch (colErr: any) {
      columns = ['error: ' + colErr.message]
    }

    return NextResponse.json({
      ok: true,
      env,
      userCount: users.totalDocs,
      users: users.docs.map((u: any) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        name: u.name,
      })),
      usersTableColumns: columns,
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      env,
      payloadError: e?.message,
      stack: e?.stack?.split('\n').slice(0, 5),
    })
  }
}
