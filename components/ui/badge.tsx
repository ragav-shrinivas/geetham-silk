import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-medium tracking-wider uppercase transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--brand-darkpink)] text-white',
        rose: 'bg-[var(--brand-rose)] text-white',
        gold: 'bg-[var(--brand-gold)] text-white',
        pink: 'bg-[var(--brand-pink)] text-[var(--brand-charcoal)]',
        outline: 'border border-current text-current',
        destructive: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
