/**
 * POST /api/apply-db
 *
 * One-shot DB schema initialisation for fresh Zeabur deployments.
 * Generates DDL SQL from the current Drizzle schema and executes it.
 *
 * Body: { secret: string }
 * Protected by PAYLOAD_SECRET — never expose this endpoint publicly.
 *
 * Usage on first deploy:
 *   curl -X POST https://your-domain.com/api/apply-db \
 *     -H 'Content-Type: application/json' \
 *     -d '{"secret":"<PAYLOAD_SECRET>"}'
 *
 * After the initial deploy you should switch to proper migration files:
 *   pnpm payload:migrate:create --name=init
 *   git add src/migrations && git commit -m "chore: add initial migration"
 * Then set Zeabur's start command to: pnpm start:migrate
 */
import { NextResponse } from 'next/server'
import { createRequire } from 'module'
import { join } from 'path'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const db = payload.db as any

    // Load drizzle-kit api.js via absolute require (avoids ESM/webpack issues)
    const cjsRequire = createRequire(import.meta.url)
    const apiJsPath = join(process.cwd(), 'node_modules', 'drizzle-kit', 'api.js')
    const { generateDrizzleJson, generateMigration } = cjsRequire(apiJsPath)

    const drizzleJsonAfter = generateDrizzleJson(db.schema)
    const drizzleJsonBefore = { ...db.defaultDrizzleSnapshot }
    if (db.schemaName) {
      drizzleJsonBefore.schemas = { [db.schemaName]: db.schemaName }
    }

    const sqlStatements: string[] = await generateMigration(drizzleJsonBefore, drizzleJsonAfter)

    if (sqlStatements.length === 0) {
      return NextResponse.json({ ok: true, message: 'DB schema is already up to date', applied: 0 })
    }

    // Execute each statement against the connected DB
    const drizzle = db.drizzle
    const { sql } = await import('drizzle-orm')
    let applied = 0
    const errors: string[] = []

    for (const stmt of sqlStatements) {
      const trimmed = stmt.trim()
      if (!trimmed) continue
      try {
        await drizzle.execute(sql.raw(trimmed))
        applied++
      } catch (err: any) {
        errors.push(`[stmt ${applied + 1}] ${err?.message ?? String(err)}`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: `Applied ${applied}/${sqlStatements.length} statements with ${errors.length} error(s)`,
          applied,
          total: sqlStatements.length,
          errors,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully applied ${applied} SQL statement(s)`,
      applied,
      total: sqlStatements.length,
    })
  } catch (err: any) {
    console.error('[apply-db]', err)
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 },
    )
  }
}
