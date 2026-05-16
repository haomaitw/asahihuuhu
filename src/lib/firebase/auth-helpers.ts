import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase/admin'

export interface AdminSessionUser {
  uid: string
  email: string | undefined
  role: string
}

/**
 * Verify the Firebase session cookie and check role membership.
 *
 * @param allowedRoles  Roles that are permitted to proceed.
 *                      Defaults to all admin-facing roles.
 * @returns             The decoded session payload, or null if the session is
 *                      missing, invalid, or the user's role is not allowed.
 */
export async function verifyAdminSession(
  allowedRoles: string[] = ['super-admin', 'admin', 'staff'],
): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('__session')?.value
  if (!session) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const role = (decoded as any).role as string | undefined
    if (!role || !allowedRoles.includes(role)) return null
    return { uid: decoded.uid, email: decoded.email, role }
  } catch {
    return null
  }
}
