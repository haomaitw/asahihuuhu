/**
 * Next.js instrumentation hook — runs once when the server starts.
 * Automatically syncs the Payload/Drizzle schema to the database so that
 * new fields and tables are created without needing to run `payload migrate`
 * manually after every deployment.
 */
export async function register() {
  // Only run in the Node.js runtime (not Edge) and only when a DB is configured
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (!process.env.POSTGRES_URI && !process.env.DATABASE_URL) return

  try {
    const { createRequire } = await import('module')
    const { getPayload } = await import('payload')
    const { default: configPromise } = await import('@payload-config')
    const { sql } = await import('drizzle-orm')

    const payload = await getPayload({ config: configPromise })
    const db = (payload as any).db

    const cjsRequire = createRequire(import.meta.url)
    // Use bare specifier so Node resolves relative to this module's location —
    // works correctly in standalone mode where node_modules live next to server.js.
    const { generateDrizzleJson, generateMigration } = cjsRequire('drizzle-kit/api')

    const drizzleJsonAfter = generateDrizzleJson(db.schema)
    const drizzleJsonBefore = { ...db.defaultDrizzleSnapshot }
    if (db.schemaName) {
      drizzleJsonBefore.schemas = { [db.schemaName]: db.schemaName }
    }

    const sqlStatements: string[] = await generateMigration(drizzleJsonBefore, drizzleJsonAfter)

    if (sqlStatements.length === 0) {
      console.log('[startup] DB schema is up to date')
      return
    }

    let applied = 0
    for (const stmt of sqlStatements) {
      const trimmed = stmt.trim()
      if (!trimmed) continue
      try {
        await db.drizzle.execute(sql.raw(trimmed))
        applied++
      } catch (err: any) {
        // Log but don't throw — partial schema is better than a crashed server
        console.error(`[startup] DB stmt failed: ${err?.message ?? err}`)
      }
    }

    console.log(`[startup] Applied ${applied}/${sqlStatements.length} DB schema statement(s)`)
  } catch (err: any) {
    // Never crash the server due to schema sync failure
    console.error('[startup] DB schema sync error:', err?.message ?? err)
  }
}
