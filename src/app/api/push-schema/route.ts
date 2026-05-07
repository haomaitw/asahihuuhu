import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// TEMPORARY — push DB schema for fresh database initialization.
// Uses the same approach as Payload's `createMigration` but executes SQL directly.
// Call once on a new deployment, then delete this file.
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

    if (tablesBefore.length > 0) {
      return NextResponse.json({
        ok: true,
        message: 'Tables already exist — skipping schema push',
        tablesBefore,
      })
    }

    // Use the same approach as Payload's createMigration:
    // generateDrizzleJson → generateMigration → execute SQL directly
    const { generateDrizzleJson, generateMigration } = db.requireDrizzleKit()

    // Desired schema snapshot (from Payload's in-memory Drizzle schema)
    const drizzleJsonAfter = generateDrizzleJson(db.schema)

    // "Before" snapshot = empty DB (Payload's defaultDrizzleSnapshot represents blank state)
    const drizzleJsonBefore = { ...db.defaultDrizzleSnapshot }
    if (db.schemaName) {
      drizzleJsonBefore.schemas = { [db.schemaName]: db.schemaName }
    }

    // Generate the SQL statements needed to go from empty → desired schema
    const sqlStatements: string[] = await generateMigration(drizzleJsonBefore, drizzleJsonAfter)

    if (!sqlStatements || sqlStatements.length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'generateMigration returned zero SQL statements — schema may already match or generation failed',
        schemaKeyCount: Object.keys(db.schema ?? {}).length,
      }, { status: 500 })
    }

    // Execute each statement in order
    const errors: string[] = []
    let executed = 0
    for (const sql of sqlStatements) {
      try {
        await db.pool.query(sql)
        executed++
      } catch (e: any) {
        errors.push(`SQL error: ${e?.message} | SQL: ${sql.slice(0, 120)}`)
      }
    }

    const afterResult = await db.pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    )
    const tablesAfter = afterResult.rows.map((r: any) => r.tablename)

    return NextResponse.json({
      ok: errors.length === 0,
      message: errors.length === 0
        ? 'Database schema created successfully'
        : `Done with ${errors.length} errors`,
      tablesBefore,
      tablesAfter,
      newTables: tablesAfter.filter((t: string) => !tablesBefore.includes(t)),
      sqlCount: sqlStatements.length,
      executed,
      errors: errors.slice(0, 10),
    })
  } catch (err: any) {
    console.error('[push-schema] Error:', err)
    return NextResponse.json({
      error: err?.message ?? String(err),
      stack: err?.stack?.split('\n').slice(0, 8),
    }, { status: 500 })
  }
}
