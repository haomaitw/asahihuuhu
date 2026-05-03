import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { SiteSettingsForm } from './SiteSettingsForm'

export const metadata = { title: '網站設定' }
export const dynamic = 'force-dynamic'

export default async function SiteSettingsPage() {
  const payload = await getAdminPayload()
  const data = await payload.findGlobal({ slug: 'site-settings', locale: 'zh-TW' })
  return <SiteSettingsForm initialData={data as any} />
}
