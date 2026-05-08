import { NextResponse } from 'next/server'
import { createRequire } from 'module'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const db = payload.db as any

    // Load drizzle-kit's CJS api.js via an absolute path built from process.cwd().
    // This bypasses both webpack module-ID substitution (which breaks .resolve())
    // and the exports-map condition lookup (which on Node 22 may load api.mjs).
    const cjsRequire = createRequire(import.meta.url)
    const { join } = await import('path')
    const apiJsPath = join(process.cwd(), 'node_modules', 'drizzle-kit', 'api.js')
    const { generateDrizzleJson, generateMigration } = cjsRequire(apiJsPath)

    const drizzleJsonAfter = generateDrizzleJson(db.schema)
    const drizzleJsonBefore = { ...db.defaultDrizzleSnapshot }
    if (db.schemaName) {
      drizzleJsonBefore.schemas = { [db.schemaName]: db.schemaName }
    }

    const sqlStatements: string[] = await generateMigration(drizzleJsonBefore, drizzleJsonAfter)

    return NextResponse.json({
      ok: true,
      statementCount: sqlStatements.length,
      sql: sqlStatements,
      snapshot: drizzleJsonAfter,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? String(err), stack: err?.stack?.split('\n').slice(0, 10) },
      { status: 500 },
    )
  }
}
