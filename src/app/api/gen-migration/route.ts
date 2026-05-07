import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
// Static import so nft includes drizzle-kit in standalone output
import { generateDrizzleJson, generateMigration } from 'drizzle-kit/api'

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })
    const db = payload.db as any

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
