import { Sparkle } from '@/components/common/Motifs'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<Size, string> = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-4xl sm:text-5xl',
  xl: 'text-5xl sm:text-6xl lg:text-7xl',
}

// Wider tracking at larger sizes — luxury fashion-house convention.
const TRACKING: Record<Size, string> = {
  sm: '0.16em',
  md: '0.2em',
  lg: '0.26em',
  xl: '0.32em',
}

const TAGLINE_CLASS: Record<Size, string> = {
  sm: 'text-[8px] tracking-[0.28em] mt-0.5',
  md: 'text-[9px] tracking-[0.3em] mt-1',
  lg: 'text-[10px] sm:text-[11px] tracking-[0.34em] mt-2',
  xl: 'text-xs sm:text-sm tracking-[0.4em] mt-3',
}

const SPARKLE_SIZE: Record<Size, number> = { sm: 9, md: 11, lg: 14, xl: 18 }

interface WordmarkProps {
  size?: Size
  className?: string
  /** animated rose-gold sheen sweep (default true) */
  shine?: boolean
  /** flank the wordmark with logo-style sparkles */
  sparkles?: boolean
  /** show the "Women's & Kids Clothing Store" line */
  tagline?: boolean
  as?: 'span' | 'div' | 'h1' | 'h3'
}

/**
 * Logo-inspired "GEETHAMS SILKS" wordmark — Cormorant Garamond, uppercase,
 * custom letter-spacing, rose-gold gradient with a subtle moving shine.
 */
export default function Wordmark({
  size = 'md',
  className,
  shine = true,
  sparkles = false,
  tagline = false,
  as: Tag = 'span',
}: WordmarkProps) {
  const tracking = TRACKING[size]
  return (
    <Tag className={cn('inline-flex flex-col items-center leading-none select-none', className)}>
      <span className="inline-flex items-center" style={{ gap: tracking }}>
        {sparkles && <Sparkle size={SPARKLE_SIZE[size]} className="text-[var(--brand-gold)] shrink-0 opacity-80" />}
        <span
          className={cn(
            'font-serif font-medium uppercase wordmark-glow whitespace-nowrap',
            SIZE_CLASS[size],
            shine ? 'text-rosegold-shine' : 'text-rosegold'
          )}
          // trailing letter-spacing is balanced with matching left padding for optical centering
          style={{ letterSpacing: tracking, paddingLeft: tracking }}
        >
          Geethams Silks
        </span>
        {sparkles && <Sparkle size={SPARKLE_SIZE[size]} className="text-[var(--brand-gold)] shrink-0 opacity-80" />}
      </span>

      {tagline && (
        <span className={cn('font-sans uppercase text-[var(--brand-gold)] font-medium', TAGLINE_CLASS[size])}>
          Women&apos;s &amp; Kids Clothing Store
        </span>
      )}
    </Tag>
  )
}
