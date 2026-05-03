import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { AboutPageForm } from './AboutPageForm'

export const metadata = { title: '關於設定' }
export const dynamic = 'force-dynamic'

export default async function AboutPageSettingsPage() {
  const payload = await getAdminPayload()
  const data = await payload.findGlobal({ slug: 'about-page', locale: 'zh-TW' })
  return <AboutPageForm initialData={data as any} />
}
