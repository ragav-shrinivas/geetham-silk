'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  /** Where to go when there's no in-app history to return to. */
  fallback: string
  label?: string
  /** 'default' = dark text for light pages · 'overlay' = white for hero pages. */
  variant?: 'default' | 'overlay'
  className?: string
}

/**
 * Premium back control. Prefers real browser history (so Product → Shop returns
 * to the exact scroll/filter you came from); if the page was opened directly
 * (no in-app history), it routes to an intelligent fallback instead of dumping
 * the user onto an external referrer or a dead end.
 */
export default function BackButton({ fallback, label = 'Back', variant = 'default', className }: BackButtonProps) {
  const router = useRouter()

  function handleBack() {
    if (typeof window === 'undefined') return router.push(fallback)
    const ref = document.referrer
    const sameOrigin = !!ref && ref.startsWith(window.location.origin)
    // Real history from in-app navigation → step back. Otherwise use the fallback.
    if (sameOrigin || window.history.length > 1) {
      router.back()
    } else {
      router.push(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={`Go back to ${label === 'Back' ? 'previous page' : label}`}
      className={cn(
        'group inline-flex items-center gap-2 min-h-[44px] pr-3 pl-1 text-[11px] tracking-[0.22em] uppercase font-medium transition-colors duration-300 active:scale-[0.97]',
        variant === 'overlay'
          ? 'text-white/85 hover:text-white'
          : 'text-[var(--brand-charcoal)]/70 hover:text-[var(--brand-rose)]',
        className
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 group-hover:-translate-x-0.5',
          variant === 'overlay'
            ? 'border-white/30 group-hover:border-white/70 group-hover:bg-white/5'
            : 'border-[var(--brand-charcoal)]/15 group-hover:border-[var(--brand-rose)] group-hover:bg-[var(--brand-rose)]/5'
        )}
      >
        <ArrowLeft size={15} />
      </span>
      {label}
    </button>
  )
}
