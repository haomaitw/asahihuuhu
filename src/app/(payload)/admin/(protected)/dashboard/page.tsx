import type { Metadata } from 'next'
import { adminDb } from '@/lib/firebase/admin'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let stats = {
    totalProducts: 0,
    pendingShipmentCount: 0,
    processingOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
  }
  let lowStockProducts: { id: string; name: string; stock: number }[] = []
  let recentOrders: any[] = []

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayIso = today.toISOString()

    const [productsSnap, ordersSnap] = await Promise.all([
      adminDb.collection('products').get(),
      adminDb.collection('orders').orderBy('createdAt', 'desc').limit(500).get(),
    ])

    const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any))
    const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any))

    const paidOrders = orders.filter((o: any) => o.status === 'paid')
    stats = {
      totalProducts: products.length,
      pendingShipmentCount: paidOrders.filter((o: any) => o.fulfillmentStatus === 'unfulfilled').length,
      processingOrders: orders.filter((o: any) => o.fulfillmentStatus === 'processing').length,
      todayOrders: orders.filter((o: any) => (o.createdAt ?? '') >= todayIso).length,
      totalRevenue: paidOrders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0),
    }

    lowStockProducts = products
      .filter((p: any) => p.trackStock && (p.stock ?? 0) <= (p.lowStockThreshold ?? 3))
      .map((p: any) => ({
        id: p.id,
        name: typeof p.name === 'object' ? (p.name['zh-TW'] ?? p.id) : (p.name ?? p.id),
        stock: p.stock ?? 0,
      }))

    recentOrders = orders.slice(0, 8).map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber ?? null,
      status: o.status ?? null,
      fulfillmentStatus: o.fulfillmentStatus ?? null,
      totalAmount: o.totalAmount != null ? Number(o.totalAmount) : null,
      createdAt: o.createdAt ?? null,
      customerName: o.customerName ?? null,
    }))
  } catch {
    // Firestore not ready — show zeros
  }

  return <DashboardClient stats={stats} recentOrders={recentOrders} lowStockProducts={lowStockProducts} />
}
