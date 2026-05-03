import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { MediaLibraryClient } from './MediaLibraryClient'

export const metadata = { title: '媒體庫' }
export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const payload = await getAdminPayload()
  const { docs, totalDocs } = await payload.find({
    collection: 'media',
    limit: 100,
    sort: '-createdAt',
  })
  return <MediaLibraryClient docs={docs as any[]} total={totalDocs} />
}
