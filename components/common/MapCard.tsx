import { MapPin, ExternalLink } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Map preview card — the entire card is one link opening Google Maps.
 * Aspect ratio: 4/3 on mobile (taller for better preview), 16/9 on sm+.
 */
export default function MapCard({ className }: { className?: string }) {
  return (
    <a
      href={SITE.maps}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Geethams Silks location in Google Maps"
      className={cn(
        'group relative block aspect-[4/3] sm:aspect-[16/9] overflow-hidden border border-[var(--brand-pink)]/25 bg-[var(--brand-cream-deep)] rounded-2xl',
        className
      )}
    >
      <iframe
        src={SITE.mapsEmbed}
        title="Geethams Silks on Google Maps"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 w-full h-full border-0 pointer-events-none grayscale-[15%] transition-[filter] duration-700 group-hover:grayscale-0 scale-[1.02]"
      />

      {/* gradient overlay */}
      <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent pointer-events-none" />
      <span className="absolute inset-0 ring-1 ring-inset ring-black/8 pointer-events-none rounded-2xl" />

      {/* bottom bar */}
      <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-[var(--brand-charcoal)] text-[10px] tracking-[0.15em] uppercase px-3.5 py-2 rounded-full shadow-md">
          <MapPin size={11} className="text-[var(--brand-rose)] shrink-0" />
          Palavakkam, Chennai
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[var(--brand-darkpink)] text-white text-[10px] tracking-[0.15em] uppercase px-3.5 py-2 rounded-full shadow-md transition-colors duration-300 group-hover:bg-[var(--brand-darkpink-deep)]">
          <span className="hidden sm:inline">Open Maps</span>
          <ExternalLink size={11} />
        </span>
      </span>

      {/* hover ring */}
      <span className="absolute inset-0 rounded-2xl ring-2 ring-[var(--brand-darkpink)]/0 group-hover:ring-[var(--brand-darkpink)]/30 transition-all duration-300 pointer-events-none" />
    </a>
  )
}
