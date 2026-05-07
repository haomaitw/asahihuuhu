import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// TEMPORARY — push DB schema for fresh database initialization.
export async function POST(request: Request) {
  try {
    const { secret } = await request.json()

    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const db = payload.db as any

    const beforeResult = await db.pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    const tablesBefore = beforeResult.rows.map((r: any) => r.tablename)

    // Debug schema info
    const schemaKeys = Object.keys(db.schema ?? {})
    const dbKeys = Object.keys(db).filter((k) => !['pool', 'schema', 'drizzle', 'payload'].includes(k))

    // Try pushDevSchema
    let pushResult: 'ok' | string = 'not_run'
    try {
      const { pushDevSchema } = await import('@payloadcms/drizzle')
      await pushDevSchema(db)
      pushResult = 'ok'
    } catch (e: any) {
      pushResult = `error: ${e?.message ?? String(e)}`
    }

    // If schema is populated but pushDevSchema didn't create tables,
    // try drizzle-kit pushSchema directly
    let directPushResult: 'ok' | 'skipped' | string = 'skipped'
    const afterFirstCheck = await db.pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    const tablesAfterFirst = afterFirstCheck.rows.map((r: any) => r.tablename)

    if (tablesAfterFirst.length === 0 && schemaKeys.length > 0 && db.drizzle) {
      try {
        const { pushSchema } = await import('drizzle-kit/api')
        // Pass the Payload db schema and its existing drizzle instance directly
        await (pushSchema as any)(db.schema, db.drizzle)
        directPushResult = 'ok'
      } catch (e: any) {
        directPushResult = `error: ${e?.message ?? String(e)}`
      }
    }

    const afterResult = await db.pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    const tablesAfter = afterResult.rows.map((r: any) => r.tablename)

    return NextResponse.json({
      ok: true,
      tablesBefore,
      tablesAfter,
      newTables: tablesAfter.filter((t: string) => !tablesBefore.includes(t)),
      debug: {
        schemaKeyCount: schemaKeys.length,
        schemaKeySample: schemaKeys.slice(0, 15),
        dbKeys,
        pushResult,
        directPushResult,
        tablesAfterFirstPush: tablesAfterFirst.length,
      },
    })
  } catch (err: any) {
    console.error('[push-schema] Error:', err)
    return NextResponse.json({
      error: err?.message ?? String(err),
      stack: err?.stack?.split('\n').slice(0, 8),
    }, { status: 500 })
  }
}
