import * as React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-adm-md bg-adm-border-subtle', className)}
      {...props}
    />
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-adm-border-subtle">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-8 w-8 rounded-adm-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-5 w-16 rounded-adm-sm" />
      <Skeleton className="h-5 w-14" />
      <Skeleton className="h-7 w-7 rounded-adm-md" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-adm-xl border border-adm-border-subtle overflow-hidden bg-adm-bg-elevated">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-adm-bg-base border-b border-adm-border-subtle">
        <Skeleton className="h-3 w-3" />
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-3" style={{ width: `${[16,28,12,10][i-1]}%` }} />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  )
}
