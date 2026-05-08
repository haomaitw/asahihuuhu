import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// ── PATCH /api/users/[id] ─────────────────────────────────────────────────────
// Updates name, role, and optionally password for an admin user.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    // Authenticate the requesting user
    const { user: currentUser } = await payload.auth({ headers: request.headers })
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, role, password } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (password) updateData.password = password

    const updated = await payload.update({
      collection: 'users',
      id,
      data: updateData,
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true, doc: updated })
  } catch (err: any) {
    console.error('[PATCH /api/users/[id]]', err)
    return NextResponse.json(
      { error: err?.message ?? 'Internal server error' },
      { status: 500 },
    )
  }
}

// ── DELETE /api/users/[id] ────────────────────────────────────────────────────
// Deletes an admin user. Prevents self-deletion.

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    // Authenticate the requesting user
    const { user: currentUser } = await payload.auth({ headers: request.headers })
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent self-deletion
    if (String(currentUser.id) === String(id)) {
      return NextResponse.json(
        { error: '無法刪除目前登入的帳號' },
        { status: 400 },
      )
    }

    await payload.delete({
      collection: 'users',
      id,
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[DELETE /api/users/[id]]', err)
    return NextResponse.json(
      { error: err?.message ?? 'Internal server error' },
      { status: 500 },
    )
  }
}
