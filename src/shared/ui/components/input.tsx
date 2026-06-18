import * as React from 'react'
import { cn } from '@/shared/ui'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base font-medium shadow-sm transition-all duration-200',
          'placeholder:text-muted-foreground/60 placeholder:font-normal',
          'focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none',
          'hover:border-border/80',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
