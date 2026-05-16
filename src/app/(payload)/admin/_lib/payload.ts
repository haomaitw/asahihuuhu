import { adminDb } from '@/lib/firebase/admin'

export async function getAdminDb() {
  return adminDb
}

export const STATUS_LABELS: Record<string, { label: string; variant: 'warning' | 'info' | 'danger' | 'neutral' | 'success' }> = {
  pending_payment: { label: '待付款', variant: 'warning' },
  pending:         { label: '待付款', variant: 'warning' },
  paid:            { label: '已付款', variant: 'success' },
  failed:          { label: '付款失敗', variant: 'danger' },
  refunded:        { label: '已退款', variant: 'neutral' },
  published:       { label: '已發布', variant: 'success' },
  draft:           { label: '草稿', variant: 'neutral' },
}

export const FULFILLMENT_LABELS: Record<string, { label: string; variant: 'warning' | 'info' | 'danger' | 'neutral' | 'success' }> = {
  unfulfilled: { label: '未出貨', variant: 'neutral' },
  processing:  { label: '備貨中', variant: 'info' },
  shipped:     { label: '已出貨', variant: 'success' },
  delivered:   { label: '已送達', variant: 'success' },
  cancelled:   { label: '已取消', variant: 'danger' },
}

export const CATEGORY_LABELS: Record<string, string> = {
  goods:    'Goods',
  seasonal: 'Seasonal',
}
