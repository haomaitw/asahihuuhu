import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}>
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-adm-xl bg-adm-bg-base border border-adm-border-subtle text-adm-text-tertiary">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-adm-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-adm-text-secondary max-w-xs">{description}</p>}
      {action && (
        <Button variant="primary" size="md" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
