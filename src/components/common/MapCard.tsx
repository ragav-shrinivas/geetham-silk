import { MapPin, ExternalLink } from 'lucide-react'
import { SITE } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Map preview that acts like an image: the embed is non-interactive and the
 * whole card is one link that opens the boutique's pin in Google Maps.
 */
export default function MapCard({ className }: { className?: string }) {
  return (
    <a
      href={SITE.maps}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open Geethams Silks location in Google Maps"
      className={cn(
        'group relative block aspect-[16/10] overflow-hidden border border-[var(--brand-pink)]/25 bg-[var(--brand-cream-deep)]',
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
        className="absolute inset-0 w-full h-full border-0 pointer-events-none grayscale-[20%] transition-[filter] duration-700 group-hover:grayscale-0"
      />

      {/* soft grade + hover ring */}
      <span className="absolute inset-0 bg-gradient-to-t from-[var(--brand-charcoal)]/35 via-transparent to-transparent pointer-events-none" />
      <span className="absolute inset-0 ring-1 ring-inset ring-black/5 pointer-events-none" />

      {/* open-in-maps pill */}
      <span className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none">
        <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-[var(--brand-charcoal)] text-[11px] tracking-[0.18em] uppercase px-4 py-2.5 shadow-lg">
          <MapPin size={13} className="text-[var(--brand-rose)]" />
          388, Periyar Salai, Palavakkam
        </span>
        <span className="inline-flex items-center gap-2 bg-[var(--brand-charcoal)]/90 text-white text-[11px] tracking-[0.18em] uppercase px-4 py-2.5 shadow-lg transition-colors duration-300 group-hover:bg-[var(--brand-rose)]">
          <span className="hidden sm:inline">Open in Maps</span>
          <ExternalLink size={13} />
        </span>
      </span>
    </a>
  )
}
