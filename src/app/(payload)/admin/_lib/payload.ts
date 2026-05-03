import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getAdminPayload() {
  return getPayload({ config: configPromise })
}

export const STATUS_LABELS: Record<string, { label: string; variant: 'warning' | 'info' | 'danger' | 'neutral' | 'success' }> = {
  pending:   { label: '待付款', variant: 'warning' },
  paid:      { label: '已付款', variant: 'success' },
  failed:    { label: '付款失敗', variant: 'danger' },
  refunded:  { label: '已退款', variant: 'neutral' },
  published: { label: '已發布', variant: 'success' },
  draft:     { label: '草稿', variant: 'neutral' },
}

export const CATEGORY_LABELS: Record<string, string> = {
  goods:    'Goods',
  seasonal: 'Seasonal',
}
