import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminStorage } from '@/lib/firebase/admin'
import { verifyAdminSession } from '@/lib/firebase/auth-helpers'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg',
])

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100 MB

export async function GET() {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) return NextResponse.json({ error: '請先登入' }, { status: 401 })

  try {
    const snap = await adminDb.collection('media').orderBy('createdAt', 'desc').get()
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ docs, totalDocs: docs.length })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to list media' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAdminSession(['super-admin', 'admin', 'staff'])
  if (!user) return NextResponse.json({ error: '請先登入' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const alt = ((formData.get('alt') as string) ?? '').slice(0, 200)

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: '不支援的檔案類型，請上傳圖片或影片' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Validate file size
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '檔案大小不得超過 100MB' }, { status: 400 })
    }

    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const mimeType = file.type
    const ext = originalName.split('.').pop() ?? ''
    const storagePath = `media/${Date.now()}-${originalName}`

    const bucket = adminStorage.bucket()
    const fileRef = bucket.file(storagePath)
    await fileRef.save(buffer, { metadata: { contentType: mimeType } })
    await fileRef.makePublic()

    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`

    const now = new Date().toISOString()
    const docRef = await adminDb.collection('media').add({
      url,
      filename: file.name,
      mimeType,
      alt,
      size: buffer.byteLength,
      ext,
      uploadedBy: user.uid,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json(
      { ok: true, doc: { id: docRef.id, url, filename: file.name, mimeType, alt } },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[media upload]', err?.message)
    return NextResponse.json({ error: '上傳失敗，請稍後再試' }, { status: 500 })
  }
}
