import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FeatureFlagsForm } from './FeatureFlagsForm'

export const metadata = { title: '功能開關' }
export const dynamic = 'force-dynamic'

export default async function FeatureFlagsPage() {
  const headersList = await headers()
  const payload = await getPayload({ config: configPromise })

  let user: any = null
  try {
    const result = await payload.auth({ headers: headersList })
    user = result.user
  } catch {}

  if (!user || user.role !== 'super-admin') {
    redirect('/admin/dashboard')
  }

  let data: any = null
  try {
    data = await payload.findGlobal({ slug: 'feature-flags' })
  } catch {
    // DB table not ready — render form with defaults
  }

  return <FeatureFlagsForm initialData={data} />
}
