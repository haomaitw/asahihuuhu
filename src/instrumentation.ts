/**
 * Next.js instrumentation hook — runs once when the server starts.
 *
 * Schema sync approach: instead of importing @payload-config directly (which forces
 * webpack to trace the entire payload dependency chain and breaks Edge compilation),
 * we call /api/apply-db via local HTTP after the server becomes ready. That route is
 * compiled by webpack correctly as a regular API route. This file has no problematic
 * imports and compiles cleanly for both Node.js and Edge runtimes.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (!process.env.POSTGRES_URI && !process.env.DATABASE_URL) return
  if (!process.env.PAYLOAD_SECRET) return

  // Don't block server startup — sync runs in background after server is ready
  syncDbSchema().catch((err: any) =>
    console.error('[startup] DB schema sync error:', err?.message ?? err),
  )
}

async function syncDbSchema() {
  const port = process.env.PORT ?? 3000
  const secret = process.env.PAYLOAD_SECRET!
  const url = `http://127.0.0.1:${port}/api/apply-db`

  for (let attempt = 0; attempt < 8; attempt++) {
    // Wait for the server to become ready before the first attempt
    await new Promise<void>(resolve => setTimeout(resolve, 3000))
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      const data = (await res.json()) as any
      if (data.ok) {
        console.log(`[startup] DB schema: ${data.message}`)
      } else {
        console.error('[startup] DB schema error:', data.error ?? data.message)
      }
      return
    } catch {
      // Server not ready yet — will retry
    }
  }
  console.error('[startup] DB schema: /api/apply-db unreachable after 8 attempts')
}
