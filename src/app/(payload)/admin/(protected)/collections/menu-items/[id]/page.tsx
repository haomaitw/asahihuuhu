import { adminDb } from '@/lib/firebase/admin'
import { notFound } from 'next/navigation'
import { MenuItemForm } from '../MenuItemForm'

export const dynamic = 'force-dynamic'

export default async function EditMenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const snap = await adminDb.collection('menu-items').doc(id).get()
  if (!snap.exists) notFound()

  const data = { id: snap.id, ...snap.data() }
  return <MenuItemForm initialData={data} isEdit />
}
