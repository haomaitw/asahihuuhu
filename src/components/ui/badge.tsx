import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-adm-sm font-medium transition-colors select-none',
  {
    variants: {
      variant: {
        neutral: 'bg-adm-bg-sunken text-adm-text-secondary',
        brand:   'bg-adm-brand-100 text-adm-brand-700',
        success: 'bg-adm-success-50 text-adm-success-600',
        warning: 'bg-adm-warning-50 text-adm-warning-600',
        danger:  'bg-adm-danger-50 text-adm-danger-600',
        info:    'bg-adm-info-50 text-adm-info-600',
      },
      size: {
        sm: 'h-5 px-1.5 text-2xs',
        md: 'h-6 px-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}
