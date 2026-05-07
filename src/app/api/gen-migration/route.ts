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

    // Use createRequire to load drizzle-kit's CJS api.js directly by resolving
    // the package root and appending /api.js — this bypasses the exports map
    // condition lookup so Node always loads the CJS build (not api.mjs).
    const cjsRequire = createRequire(import.meta.url)
    // resolve drizzle-kit root (index.js), then swap to api.js
    const indexPath: string = cjsRequire.resolve('drizzle-kit')
    const apiPath = indexPath.replace(/[/\\]index\.js$/, '/api.js')
    const { generateDrizzleJson, generateMigration } = cjsRequire(apiPath)

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
