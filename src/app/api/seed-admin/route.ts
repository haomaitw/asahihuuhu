import { NextResponse } from 'next/server'

// Payload admin seed removed — use /api/seed-firebase-admin instead.
export async function POST() {
  return NextResponse.json({ error: 'This route is deprecated. Use /api/seed-firebase-admin instead.' }, { status: 410 })
}
