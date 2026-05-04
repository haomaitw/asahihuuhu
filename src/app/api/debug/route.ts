import { NextResponse } from 'next/server'

// Minimal health check — no Payload, no DB, just env vars
export async function GET() {
  return NextResponse.json({
    ok: true,
    POSTGRES_URI: process.env.POSTGRES_URI
      ? process.env.POSTGRES_URI.replace(/:([^@]+)@/, ':***@')
      : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:([^@]+)@/, ':***@')
      : 'NOT SET',
    PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  })
}
