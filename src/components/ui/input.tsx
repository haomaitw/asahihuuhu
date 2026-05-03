import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  description?: string
  required?: boolean
  suffix?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, description, required, suffix, id, ...props }, ref) => {
    const inputId = id ?? React.useId()
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs uppercase tracking-wider font-medium text-adm-text-secondary">
            {label}{required && <span className="ml-0.5 text-adm-danger-500">*</span>}
          </label>
        )}
        {description && <p className="text-xs text-adm-text-tertiary -mt-1">{description}</p>}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-9 w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary',
              'transition-colors duration-150',
              'focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15',
              'disabled:bg-adm-bg-sunken disabled:cursor-not-allowed disabled:text-adm-text-disabled',
              error && 'border-adm-danger-500 focus:border-adm-danger-500 focus:ring-adm-danger-500/15',
              suffix && 'pr-9',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-adm-text-tertiary">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-adm-danger-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
