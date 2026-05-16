import { NextResponse } from 'next/server'

// Payload + drizzle-kit removed — Firebase migration complete. This route is a no-op stub.
export async function POST() {
  return NextResponse.json({ ok: true, message: 'No-op: using Firestore, no migrations needed' })
}
