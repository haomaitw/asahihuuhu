import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

type ErrorStateProps = {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title = '發生錯誤', description = '無法載入資料，請稍後再試。', onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-adm-xl bg-adm-danger-50 text-adm-danger-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-adm-text-primary mb-1">{title}</h3>
      <p className="text-sm text-adm-text-secondary max-w-xs mb-5">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="md" onClick={onRetry}>
          重試
        </Button>
      )}
    </div>
  )
}
