import Link from 'next/link'
import { Plus, Package } from 'lucide-react'
import { getAdminPayload } from '@/app/(payload)/admin/_lib/payload'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'

export const metadata = { title: '商品管理' }
export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const payload = await getAdminPayload()
  const { docs, totalDocs } = await payload.find({
    collection: 'products',
    locale: 'zh-TW',
    limit: 100,
    sort: '-createdAt',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">商品管理</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {totalDocs} 件商品</p>
        </div>
        <Link href="/admin/collections/products/create">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" />
            新增商品
          </Button>
        </Link>
      </div>

      <Card>
        {docs.length === 0 ? (
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="尚無商品"
            description="點擊「新增商品」建立第一件商品"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['商品名稱', 'Slug', '售價', '類別', '狀態', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((p: any) => (
                  <tr key={p.id} className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0].url} alt="" className="h-10 w-10 rounded-adm-md object-cover bg-adm-bg-sunken" />
                        ) : (
                          <div className="h-10 w-10 rounded-adm-md bg-adm-bg-sunken flex items-center justify-center">
                            <Package className="h-4 w-4 text-adm-text-disabled" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-adm-text-primary">{p.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-adm-text-secondary font-mono">{p.slug}</td>
                    <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-primary">NT$ {Number(p.price ?? 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-adm-text-secondary">{p.category === 'goods' ? 'Goods' : 'Seasonal'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={p.isAvailable ? 'success' : 'neutral'} size="sm">
                        {p.isAvailable ? '上架中' : '已下架'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/admin/collections/products/${p.id}`} className="text-xs text-adm-brand-600 hover:underline">
                        編輯
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
