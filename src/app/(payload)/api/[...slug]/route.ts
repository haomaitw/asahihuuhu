import { NextResponse } from 'next/server'

// Payload REST API handler removed — Firebase migration complete.
// All API routes are now under /api/admin/* using Firebase Auth.
export async function GET()     { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
export async function POST()    { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
export async function DELETE()  { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
export async function PATCH()   { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
export async function PUT()     { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
export async function OPTIONS() { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
