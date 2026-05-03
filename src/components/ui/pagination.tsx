'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className={cn('flex items-center justify-between text-sm text-adm-text-secondary', className)}>
      <span>第 {start}–{end} 筆，共 {total} 筆</span>
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-adm-text-tertiary">每頁</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-2 text-xs text-adm-text-primary focus:outline-none focus:border-adm-brand-500"
            >
              {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="前頁">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-xs tabular-nums">{page} / {totalPages}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="後頁">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
