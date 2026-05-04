import { NextResponse } from 'next/server'

export async function GET() {
  const pgUri = process.env.POSTGRES_URI || process.env.DATABASE_URL || ''

  // Try to init Payload and catch the real error
  let payloadError: string | null = null
  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@payload-config')).default
    await getPayload({ config: configPromise })
  } catch (e: any) {
    payloadError = e?.message ?? String(e)
  }

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      POSTGRES_URI_SET: !!pgUri,
      POSTGRES_URI_PREFIX: pgUri ? pgUri.substring(0, 20) + '...' : 'NOT SET',
      PAYLOAD_SECRET_SET: !!process.env.PAYLOAD_SECRET,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    },
    payloadError,
  })
}
