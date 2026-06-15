import { Sparkle } from '@/components/common/Motifs'
import { cn } from '@/lib/utils'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<Size, string> = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-4xl sm:text-5xl',
  // mobile kept small so the full wordmark never overflows a phone screen
  xl: 'text-[1.75rem] sm:text-5xl lg:text-7xl',
}

// Wider tracking at larger sizes — luxury fashion-house convention.
const TRACKING: Record<Size, string> = {
  sm: '0.16em',
  md: '0.2em',
  lg: '0.26em',
  xl: '0.3em',
}

const TAGLINE_CLASS: Record<Size, string> = {
  sm: 'text-[8px] tracking-[0.28em] mt-0.5',
  md: 'text-[9px] tracking-[0.3em] mt-1',
  lg: 'text-[10px] sm:text-[11px] tracking-[0.34em] mt-2',
  xl: 'text-[10px] sm:text-sm tracking-[0.34em] sm:tracking-[0.4em] mt-2.5',
}

// optical-centering compensation for each tagline's trailing letter-spacing,
// so the tagline's glyphs stay centered under the wordmark on every screen
const TAGLINE_TRACK: Record<Size, string> = {
  sm: '0.28em',
  md: '0.3em',
  lg: '0.34em',
  xl: '0.4em',
}

const SPARKLE_SIZE: Record<Size, number> = { sm: 9, md: 11, lg: 14, xl: 18 }

interface WordmarkProps {
  size?: Size
  className?: string
  /** kept for API compatibility; the wordmark now uses a fixed 3D purple treatment */
  shine?: boolean
  /** flank the wordmark with logo-style sparkles */
  sparkles?: boolean
  /** show the "Women's & Kids Clothing Store" line */
  tagline?: boolean
  as?: 'span' | 'div' | 'h1' | 'h3'
}

/**
 * Logo-inspired "GEETHAMS SILKS" wordmark — Cormorant Garamond, uppercase,
 * custom letter-spacing, dark-purple beveled gradient with a 3D extrusion.
 */
export default function Wordmark({
  size = 'md',
  className,
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
            'font-serif font-medium uppercase text-purple-3d wordmark-3d whitespace-nowrap',
            SIZE_CLASS[size]
          )}
          // trailing letter-spacing is balanced with matching left padding for optical centering
          style={{ letterSpacing: tracking, paddingLeft: tracking }}
        >
          Geethams Silks
        </span>
        {sparkles && <Sparkle size={SPARKLE_SIZE[size]} className="text-[var(--brand-gold)] shrink-0 opacity-80" />}
      </span>

      {tagline && (
        <span
          className={cn('font-sans uppercase text-[var(--brand-gold)] font-medium', TAGLINE_CLASS[size])}
          style={{ paddingLeft: TAGLINE_TRACK[size] }}
        >
          Women&apos;s &amp; Kids Clothing Store
        </span>
      )}
    </Tag>
  )
}
