import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminStorage } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

export async function GET() {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) return NextResponse.json({ error: '請先登入' }, { status: 401 })

  try {
    const snap = await adminDb.collection('media').orderBy('createdAt', 'desc').get()
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) return NextResponse.json({ error: '請先登入' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const alt = (formData.get('alt') as string) ?? ''

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const originalName = file.name
    const mimeType = file.type
    const ext = originalName.split('.').pop() ?? ''
    const storagePath = `media/${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const bucket = adminStorage.bucket()
    const fileRef = bucket.file(storagePath)
    await fileRef.save(buffer, { metadata: { contentType: mimeType } })
    await fileRef.makePublic()

    const bucketName = bucket.name
    const url = `https://storage.googleapis.com/${bucketName}/${storagePath}`

    const now = new Date().toISOString()
    const docRef = await adminDb.collection('media').add({
      url,
      filename: originalName,
      mimeType,
      alt,
      size: buffer.byteLength,
      ext,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({
      ok: true,
      doc: { id: docRef.id, url, filename: originalName, mimeType, alt },
    }, { status: 201 })
  } catch (err: any) {
    console.error('[media upload]', err)
    return NextResponse.json({ error: err?.message ?? 'Upload failed' }, { status: 500 })
  }
}
