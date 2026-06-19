import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Read-only star rating display (supports halves via rounding). */
export default function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? 'fill-[var(--brand-gold)] text-[var(--brand-gold)]' : 'text-[var(--brand-charcoal)]/20'}
        />
      ))}
    </span>
  )
}
