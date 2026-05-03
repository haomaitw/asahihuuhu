'use client'
import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'h-4 w-4 shrink-0 rounded-[3px] border border-adm-border-strong bg-adm-bg-elevated transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adm-brand-500/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-adm-brand-500 data-[state=checked]:border-adm-brand-500 data-[state=checked]:text-white',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className="h-3 w-3" strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'
