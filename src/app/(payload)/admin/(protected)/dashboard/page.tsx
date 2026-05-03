import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const payload = await getPayload({ config: configPromise })

  let stats = {
    totalProducts: 0,
    pendingOrders: 0,
    totalOrders: 0,
    totalNews: 0,
  }

  try {
    const [products, orders, pendingOrders, news] = await Promise.all([
      payload.find({ collection: 'products', limit: 0 }),
      payload.find({ collection: 'orders', limit: 0 }),
      payload.find({ collection: 'orders', where: { status: { equals: 'pending' } }, limit: 0 }),
      payload.find({ collection: 'news', limit: 0 }),
    ])
    stats = {
      totalProducts: products.totalDocs,
      pendingOrders: pendingOrders.totalDocs,
      totalOrders: orders.totalDocs,
      totalNews: news.totalDocs,
    }
  } catch {
    // DB not ready — show zeros
  }

  // Fetch recent orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recentOrders: any[] = []
  try {
    const result = await payload.find({
      collection: 'orders',
      limit: 5,
      sort: '-createdAt',
    })
    recentOrders = result.docs
  } catch {
    // ignore
  }

  return <DashboardClient stats={stats} recentOrders={recentOrders} />
}
