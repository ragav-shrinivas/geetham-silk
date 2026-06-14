import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full border border-[var(--brand-pink)] bg-white px-3 py-2 text-sm text-[var(--brand-charcoal)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--brand-rose)] focus:ring-1 focus:ring-[var(--brand-rose)] disabled:cursor-not-allowed disabled:opacity-50 transition-colors rounded-none',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input }
