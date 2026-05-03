import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
  description?: string
  required?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, description, required, id, ...props }, ref) => {
    const textareaId = id ?? React.useId()
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs uppercase tracking-wider font-medium text-adm-text-secondary">
            {label}{required && <span className="ml-0.5 text-adm-danger-500">*</span>}
          </label>
        )}
        {description && <p className="text-xs text-adm-text-tertiary -mt-1">{description}</p>}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'min-h-[100px] w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2.5 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary resize-y',
            'transition-colors duration-150',
            'focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15',
            'disabled:bg-adm-bg-sunken disabled:cursor-not-allowed',
            error && 'border-adm-danger-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-adm-danger-500">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
