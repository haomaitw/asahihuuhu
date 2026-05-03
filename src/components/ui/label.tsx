'use client'
import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-xs uppercase tracking-wider font-medium text-adm-text-secondary cursor-pointer', className)}
    {...props}
  >
    {children}
    {required && <span className="ml-0.5 text-adm-danger-500">*</span>}
  </LabelPrimitive.Root>
))
Label.displayName = 'Label'
