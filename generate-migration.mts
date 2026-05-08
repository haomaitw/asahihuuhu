/**
 * Local migration generator script.
 * Run: node --import ./node_modules/tsx/dist/esm/index.cjs ./generate-migration.mts
 */
import { createRequire } from 'module'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)

// Load CJS version of drizzle-kit api (api.js, not api.mjs)
const { generateDrizzleJson, generateMigration } = require('drizzle-kit/api')
console.log('✓ drizzle-kit/api loaded (CJS)')

// Import Payload internals
const { postgresAdapter } = await import('@payloadcms/db-postgres')
const { defaultDrizzleSnapshot } = await import('@payloadcms/drizzle/postgres')
console.log('✓ Payload adapters loaded')

// Import the Payload config (tsx resolves .ts extensions)
const { default: payloadConfig } = await import('./src/payload.config.ts')
console.log('✓ Payload config loaded, collections:', payloadConfig.collections?.length)

// Create the postgres adapter (no real DB connection yet)
const adapterFactory = postgresAdapter({
  pool: { connectionString: 'postgresql://localhost/fake_for_schema_only' },
})

// Build a minimal "payload" mock object — we only need .config for schema building
const payloadMock = { config: payloadConfig } as any

// Instantiate the adapter
const db = adapterFactory.init({ payload: payloadMock }) as any
db.payload = payloadMock
console.log('✓ Adapter instantiated')

// Call init() — this builds the Drizzle schema WITHOUT connecting to DB
await db.init.call(db)
console.log('✓ Schema built, tables:', Object.keys(db.tables).length)

// Generate the Drizzle JSON snapshot from the schema
const drizzleJsonAfter = generateDrizzleJson(db.schema)

// Use the empty "before" snapshot
const drizzleJsonBefore = { ...defaultDrizzleSnapshot }
if (db.schemaName) {
  drizzleJsonBefore.schemas = { [db.schemaName]: db.schemaName }
}

// Generate SQL migration statements
const sqlStatements: string[] = await generateMigration(drizzleJsonBefore, drizzleJsonAfter)
console.log(`✓ Generated ${sqlStatements.length} SQL statements`)

// Write raw SQL for inspection
writeFileSync(
  join(__dirname, 'migration-output.sql'),
  sqlStatements.join('\n\n') + '\n',
)
console.log('✓ Wrote migration-output.sql')

// Write JSON result
writeFileSync(
  join(__dirname, 'migration-output.json'),
  JSON.stringify({ statementCount: sqlStatements.length, sql: sqlStatements, snapshot: drizzleJsonAfter }, null, 2),
)
console.log('✓ Wrote migration-output.json')

console.log('\nDone! Check migration-output.sql and migration-output.json')
