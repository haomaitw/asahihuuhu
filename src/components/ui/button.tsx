'use client'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-adm-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adm-brand-500/30 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none',
  {
    variants: {
      variant: {
        primary:   'bg-adm-brand-500 text-adm-text-inverse hover:bg-adm-brand-600',
        secondary: 'bg-adm-bg-elevated border border-adm-border-default text-adm-text-primary hover:border-adm-border-strong hover:bg-adm-bg-base',
        ghost:     'text-adm-text-secondary hover:bg-adm-brand-50 hover:text-adm-text-primary',
        danger:    'bg-adm-danger-500 text-white hover:bg-adm-danger-600',
        link:      'text-adm-brand-600 underline-offset-4 hover:underline h-auto px-0 py-0',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-11 px-5 text-base',
        icon: 'h-9 w-9 px-0',
        'icon-sm': 'h-7 w-7 px-0',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
