import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const payload = await getPayload({ config: configPromise })

  let stats = {
    totalProducts: 0,
    pendingShipmentCount: 0,
    processingOrders: 0,
    todayOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  }

  let lowStockProducts: { id: string | number; name: string; stock: number }[] = []
  let recentOrders: any[] = []

  try {
    // Today's date range
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [products, customers, pendingShipment, processingOrders, allPaid, todayResult] =
      await Promise.all([
        payload.find({ collection: 'products', limit: 0, overrideAccess: true }),
        payload.find({ collection: 'customers', limit: 0, overrideAccess: true }),
        // pendingShipment: paid but unfulfilled
        payload.find({
          collection: 'orders',
          where: {
            and: [
              { status: { equals: 'paid' } },
              { fulfillmentStatus: { equals: 'unfulfilled' } },
            ],
          },
          limit: 0,
          overrideAccess: true,
        }),
        payload.find({
          collection: 'orders',
          where: { fulfillmentStatus: { equals: 'processing' } },
          limit: 0,
          overrideAccess: true,
        }),
        // Get all paid orders to sum totalRevenue
        payload.find({
          collection: 'orders',
          where: { status: { equals: 'paid' } },
          limit: 9999,
          overrideAccess: true,
        }),
        // Today's orders
        payload.find({
          collection: 'orders',
          where: {
            and: [
              { createdAt: { greater_than_equal: todayStart.toISOString() } },
              { createdAt: { less_than_equal: todayEnd.toISOString() } },
            ],
          },
          limit: 0,
          overrideAccess: true,
        }),
      ])

    const totalRevenue = allPaid.docs.reduce(
      (sum: number, o: any) => sum + (o.totalAmount ?? 0),
      0,
    )

    // lowStock: products where trackStock=true and stock <= lowStockThreshold
    const allProducts = await payload.find({
      collection: 'products',
      where: { trackStock: { equals: true } },
      limit: 100,
      overrideAccess: true,
    })
    const lowStockDocs = allProducts.docs.filter(
      (p: any) => (p.stock ?? 0) <= (p.lowStockThreshold ?? 5),
    )
    lowStockProducts = lowStockDocs.map((p: any) => ({
      id: p.id,
      name: p.name ?? '未命名商品',
      stock: p.stock ?? 0,
    }))

    stats = {
      totalProducts: products.totalDocs,
      pendingShipmentCount: pendingShipment.totalDocs,
      processingOrders: processingOrders.totalDocs,
      todayOrders: todayResult.totalDocs,
      totalCustomers: customers.totalDocs,
      totalRevenue,
    }
  } catch {
    // DB not ready — show zeros
  }

  // Fetch recent orders (last 8)
  try {
    const result = await payload.find({
      collection: 'orders',
      limit: 8,
      sort: '-createdAt',
      overrideAccess: true,
    })
    recentOrders = result.docs
  } catch {
    // ignore
  }

  return (
    <DashboardClient
      stats={stats}
      recentOrders={recentOrders}
      lowStockProducts={lowStockProducts}
    />
  )
}
