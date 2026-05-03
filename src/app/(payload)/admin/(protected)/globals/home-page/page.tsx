import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { HomePageForm } from './HomePageForm'

export const metadata = { title: '首頁設定' }
export const dynamic = 'force-dynamic'

export default async function HomePageSettingsPage() {
  const payload = await getAdminPayload()
  const data = await payload.findGlobal({ slug: 'home-page', locale: 'zh-TW' })
  return <HomePageForm initialData={data as any} />
}
