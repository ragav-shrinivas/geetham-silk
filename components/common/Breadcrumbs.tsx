import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SITE } from '@/lib/constants'

export interface Crumb {
  label: string
  /** omit href on the current (last) page */
  href?: string
}

interface BreadcrumbsProps {
  items: Crumb[]
  /** 'default' = dark text for light pages · 'overlay' = white for hero pages. */
  variant?: 'default' | 'overlay'
  className?: string
}

/**
 * Breadcrumb trail: Home > Shop > Sarees > Product Name.
 * Desktop shows the full trail; mobile keeps it compact (the current label
 * truncates, never wraps). Emits BreadcrumbList JSON-LD for search engines.
 */
export default function Breadcrumbs({ items, variant = 'default', className }: BreadcrumbsProps) {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, ...items]

  const muted = variant === 'overlay' ? 'text-white/55' : 'text-[var(--brand-charcoal)]/75'
  const link = variant === 'overlay' ? 'text-white/75 hover:text-white' : 'text-[var(--brand-charcoal)]/80 hover:text-[var(--brand-rose)]'
  const current = variant === 'overlay' ? 'text-white' : 'text-[var(--brand-charcoal)]'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE.url}${c.href === '/' ? '' : c.href}` } : {}),
    })),
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-[11px] tracking-[0.16em] uppercase min-w-0', className)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {trail.map((c, i) => {
        const isLast = i === trail.length - 1
        // Compact on mobile: show only the last two segments (parent > current);
        // the full trail appears from sm upward.
        const hideOnMobile = i < trail.length - 2
        // The chevron leading the first mobile-visible crumb (the parent) is a
        // stray "›" on mobile — hide it there when items precede it.
        const chevronHideOnMobile = i === trail.length - 2 && trail.length > 2
        return (
          <span
            key={`${c.label}-${i}`}
            className={cn('items-center gap-1.5 min-w-0', hideOnMobile ? 'hidden sm:flex' : 'flex')}
          >
            {i > 0 && <ChevronRight size={12} className={cn('shrink-0', muted, chevronHideOnMobile && 'hidden sm:block')} />}
            {isLast || !c.href ? (
              <span className={cn('truncate max-w-[46vw] sm:max-w-[260px]', current)} aria-current="page">
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className={cn('transition-colors duration-300 whitespace-nowrap', link)}>
                {c.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
