/**
 * POST /api/apply-db
 *
 * Incrementally syncs the DB schema to match the current Drizzle/Payload schema.
 * Works for both fresh deployments (creates tables) and existing deployments
 * (adds missing columns via ALTER TABLE).
 *
 * Strategy:
 *   1. Query information_schema for what tables/columns actually exist in the DB
 *   2. Compare against the target schema from generateDrizzleJson
 *   3. CREATE TABLE for missing tables (using drizzle-kit SQL generation)
 *   4. ALTER TABLE ADD COLUMN for missing columns in existing tables
 *
 * Body: { secret: string }
 * Protected by PAYLOAD_SECRET.
 */
import { NextResponse } from 'next/server'
import { createRequire } from 'module'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const db = payload.db as any
    const drizzle = db.drizzle

    const cjsRequire = createRequire(import.meta.url)
    const { generateDrizzleJson, generateMigration } = cjsRequire('drizzle-kit/api')

    // ── Step 1: Get current DB state from information_schema ──────────────────

    const colRows = await drizzle.execute(sql`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `)

    const existingTables = new Set<string>()
    const existingCols = new Set<string>()
    for (const row of colRows.rows ?? colRows) {
      existingTables.add(row.table_name as string)
      existingCols.add(`${row.table_name}.${row.column_name}`)
    }

    // ── Step 2: Get target schema from Drizzle ────────────────────────────────

    const targetSchema = generateDrizzleJson(db.schema) as any
    const emptyBefore = { ...db.defaultDrizzleSnapshot } as any
    if (db.schemaName) {
      emptyBefore.schemas = { [db.schemaName]: db.schemaName }
    }

    let applied = 0
    const errors: string[] = []

    // ── Step 3: CREATE TABLE for tables that don't exist yet ──────────────────

    for (const [tableKey, tableSpec] of Object.entries(targetSchema.tables ?? {})) {
      const tableName = (tableSpec as any).name
      if (existingTables.has(tableName)) continue

      // Generate SQL for just this table by diffing empty → single-table schema
      const singleTableAfter = {
        ...emptyBefore,
        tables: { [tableKey]: tableSpec },
        enums: targetSchema.enums ?? {},
        schemas: targetSchema.schemas ?? {},
        sequences: targetSchema.sequences ?? {},
      }
      const stmts: string[] = await generateMigration(emptyBefore, singleTableAfter)
      for (const stmt of stmts) {
        const trimmed = stmt.trim()
        if (!trimmed) continue
        try {
          await drizzle.execute(sql.raw(trimmed))
          applied++
        } catch (err: any) {
          errors.push(`[CREATE ${tableName}] ${err?.message ?? String(err)}`)
        }
      }
    }

    // ── Step 4: ALTER TABLE ADD COLUMN for missing columns ────────────────────

    for (const tableSpec of Object.values(targetSchema.tables ?? {})) {
      const tableName = (tableSpec as any).name
      if (!existingTables.has(tableName)) continue // was just created above

      for (const col of Object.values((tableSpec as any).columns ?? {})) {
        const colName = (col as any).name
        if (existingCols.has(`${tableName}.${colName}`)) continue

        // Build the column definition for ALTER TABLE
        const colType = (col as any).type as string
        const notNull = (col as any).notNull ? ' NOT NULL' : ''
        const rawDefault = (col as any).default
        const defaultClause =
          rawDefault !== undefined && rawDefault !== null
            ? ` DEFAULT ${rawDefault}`
            : ''

        const alterSql = `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${colName}" ${colType}${defaultClause}${notNull}`
        try {
          await drizzle.execute(sql.raw(alterSql))
          applied++
        } catch (err: any) {
          errors.push(`[ADD COLUMN ${tableName}.${colName}] ${err?.message ?? String(err)}`)
        }
      }
    }

    // ── Step 5: Respond ───────────────────────────────────────────────────────

    if (applied === 0 && errors.length === 0) {
      return NextResponse.json({ ok: true, message: 'DB schema is already up to date', applied: 0 })
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `Applied ${applied} change(s) with ${errors.length} error(s)`,
          applied,
          errors,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully applied ${applied} schema change(s)`,
      applied,
    })
  } catch (err: any) {
    console.error('[apply-db]', err)
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
