import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { SiteSettingsForm } from './SiteSettingsForm'

export const metadata = { title: '網站設定' }
export const dynamic = 'force-dynamic'

export default async function SiteSettingsPage() {
  const payload = await getAdminPayload()
  let data: any = null
  try {
    data = await payload.findGlobal({ slug: 'site-settings', locale: 'zh-TW' })
  } catch {
    // DB table not ready yet — render form with empty defaults
  }
  return <SiteSettingsForm initialData={data} />
}
