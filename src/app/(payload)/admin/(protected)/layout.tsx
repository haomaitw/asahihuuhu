import type React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { AdminShell } from '@/components/admin-shell/AdminShell'
import { Toaster } from 'sonner'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  let user: { id: string; name?: string; email?: string; role?: string } | null = null
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.auth({ headers: headersList })
    if (result.user) {
      const u = result.user as any
      user = {
        id:    String(u.id),
        name:  u.name  ?? undefined,
        email: u.email ?? undefined,
        role:  u.role  ?? undefined,
      }
    }
  } catch {
    // DB not ready — fall through to redirect
  }
  if (!user) redirect('/admin/login')

  return (
    <AdminShell user={user}>
      {children}
      <Toaster position="top-right" richColors />
    </AdminShell>
  )
}
