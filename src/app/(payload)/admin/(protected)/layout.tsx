import type React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/firebase/admin'
import { AdminShell } from '@/components/admin-shell/AdminShell'
import { Toaster } from 'sonner'

const ALLOWED_ROLES = ['super-admin', 'admin', 'staff']

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value

  if (!sessionCookie) redirect('/admin/login')

  let user: { id: string; name?: string; email?: string; role?: string } | null = null
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const role = (decoded as any).role as string | undefined
    if (!role || !ALLOWED_ROLES.includes(role)) redirect('/admin/login')
    user = {
      id:    decoded.uid,
      email: decoded.email ?? undefined,
      name:  decoded.name  ?? undefined,
      role,
    }
  } catch {
    redirect('/admin/login')
  }

  return (
    <AdminShell user={user}>
      {children}
      <Toaster position="top-right" richColors />
    </AdminShell>
  )
}
