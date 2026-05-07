import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// TEMPORARY — push DB schema for fresh database initialization.
// Call once on a new deployment, then delete this file.
export async function POST(request: Request) {
  try {
    const { secret } = await request.json()

    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Payload (connects to DB)
    const payload = await getPayload({ config })

    const db = payload.db as any

    // Check tables before
    const beforeResult = await db.pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    const tablesBefore = beforeResult.rows.map((r: any) => r.tablename)

    // Use Payload's internal pushDevSchema to sync DB schema without migrations
    const { pushDevSchema } = await import('@payloadcms/drizzle')
    await pushDevSchema(db)

    // Check tables after
    const afterResult = await db.pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    const tablesAfter = afterResult.rows.map((r: any) => r.tablename)

    return NextResponse.json({
      ok: true,
      message: 'Database schema pushed successfully',
      tablesBefore,
      tablesAfter,
      newTables: tablesAfter.filter((t: string) => !tablesBefore.includes(t)),
    })
  } catch (err: any) {
    console.error('[push-schema] Error:', err)
    return NextResponse.json({
      error: err?.message ?? String(err),
      stack: err?.stack?.split('\n').slice(0, 8),
    }, { status: 500 })
  }
}
