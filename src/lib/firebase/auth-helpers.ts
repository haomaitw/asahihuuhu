import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

export interface AdminSessionUser {
  uid: string
  email: string | undefined
  role: string
}

const ALLOWED_ROLES = ['super-admin', 'admin', 'staff'] as const

/**
 * Verify the Firebase session cookie and check role membership.
 * Role is read from Firestore users/{uid} (source of truth) with fallback
 * to custom claims embedded in the session cookie.
 */
export async function verifyAdminSession(
  allowedRoles: string[] = [...ALLOWED_ROLES],
): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('__session')?.value
  if (!session) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true)
    const uid = decoded.uid

    // Firestore is the source of truth for role
    let role: string | undefined
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get()
      if (userDoc.exists) {
        role = (userDoc.data() as any)?.role
      }
    } catch {
      // Firestore unavailable — fall back to claims
    }

    // Fall back to custom claims in the token
    if (!role) role = (decoded as any).role as string | undefined

    if (!role || !allowedRoles.includes(role)) return null
    return { uid, email: decoded.email, role }
  } catch {
    return null
  }
}
