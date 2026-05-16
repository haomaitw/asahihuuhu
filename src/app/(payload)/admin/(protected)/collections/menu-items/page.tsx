import Link from 'next/link'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { adminDb } from '@/lib/firebase/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '菜單管理' }
export const dynamic = 'force-dynamic'

const CATEGORY_LABEL: Record<string, string> = {
  kakigori: '刨冰',
  crepes: '可麗餅',
  drinks: '飲品',
  goods: '商品',
}

export default async function MenuItemsPage() {
  let docs: any[] = []
  try {
    const snap = await adminDb.collection('menu-items').orderBy('category').orderBy('order', 'asc').get()
    docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    // empty
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">菜單管理</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {docs.length} 個品項</p>
        </div>
        <Link href="/admin/collections/menu-items/create">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" />
            新增品項
          </Button>
        </Link>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed className="h-6 w-6" />}
            title="尚無菜單品項"
            description="點擊「新增品項」建立第一個菜單品項（若不建立，前台將顯示預設靜態菜單）"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['品項名稱', '分類', '標籤', '排序', '狀態', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((item: any) => {
                  const name = item.name?.['zh-TW'] ?? item.name ?? '—'
                  return (
                    <tr key={item.id} className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="h-10 w-10 rounded-adm-md object-cover bg-adm-bg-sunken" />
                          ) : (
                            <div className="h-10 w-10 rounded-adm-md bg-adm-bg-sunken flex items-center justify-center">
                              <UtensilsCrossed className="h-4 w-4 text-adm-text-disabled" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-adm-text-primary">{name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-adm-text-secondary">{CATEGORY_LABEL[item.category] ?? item.category ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        {item.badge ? (
                          <Badge variant={item.badge === 'new' ? 'info' : 'warning'} size="sm">
                            {item.badge === 'new' ? 'NEW' : '季節'}
                          </Badge>
                        ) : <span className="text-adm-text-disabled text-xs">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-secondary">{item.order ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={item.isAvailable !== false ? 'success' : 'neutral'} size="sm">
                          {item.isAvailable !== false ? '顯示中' : '已隱藏'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/collections/menu-items/${item.id}`} className="text-xs text-adm-brand-600 hover:underline">
                          編輯
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
