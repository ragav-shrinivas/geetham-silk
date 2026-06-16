import BackButton from '@/components/common/BackButton'
import Breadcrumbs, { type Crumb } from '@/components/common/Breadcrumbs'
import { cn } from '@/lib/utils'

interface PageNavProps {
  /** breadcrumb trail AFTER Home (Home is prepended automatically) */
  crumbs: Crumb[]
  /** fallback route when there's no in-app history to go back to */
  fallback: string
  /** label for the back control (defaults to "Back") */
  backLabel?: string
  /** 'default' = light pages · 'overlay' = absolute white bar for hero pages */
  variant?: 'default' | 'overlay'
  className?: string
}

/**
 * Consistent page navigation: a Back control on the left and a breadcrumb trail
 * on the right. Dropped in at the top of every secondary page so users always
 * know where they are, where they came from, and how to return.
 */
export default function PageNav({ crumbs, fallback, backLabel, variant = 'default', className }: PageNavProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3',
        variant === 'overlay' && 'rounded-full bg-black/20 backdrop-blur-md px-3 py-1.5 pr-5',
        className
      )}
    >
      <BackButton fallback={fallback} label={backLabel ?? 'Back'} variant={variant} />
      <Breadcrumbs items={crumbs} variant={variant} />
    </div>
  )
}
