import { MapPin, Navigation, Clock, Phone } from 'lucide-react'
import MapCard from '@/components/common/MapCard'
import { SITE } from '@/lib/constants'

/** "Visit Our Store" — compact strip immediately below the hero. */
export default function StoreLocation() {
  return (
    <section className="py-10 sm:py-14 lg:py-20 bg-[var(--brand-babypink)] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Eyebrow */}
        <div className="mb-6 sm:mb-8 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--brand-darkpink)] font-medium mb-2">Find Us</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[var(--brand-charcoal)]">
            Visit Our <em className="not-italic text-[var(--brand-darkpink)]">Store</em>
          </h2>
        </div>

        {/* Two-column grid — stacks on mobile (map first, then details) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">

          {/* Map preview */}
          <MapCard className="rounded-2xl overflow-hidden" />

          {/* Details card */}
          <div className="bg-white rounded-2xl border border-[var(--brand-pink)]/30 p-5 sm:p-7 flex flex-col justify-center shadow-sm">
            <h3 className="font-serif text-xl sm:text-2xl font-light text-[var(--brand-charcoal)] mb-0.5">Geethams Silks</h3>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--brand-darkpink)] mb-5">Palavakkam · Chennai</p>

            <ul className="space-y-3 text-sm text-gray-600 mb-6">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[var(--brand-purple)] shrink-0 mt-0.5" />
                <span>388, Periyar Salai, Krishna Nagar, Palavakkam, Chennai 600041</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={16} className="text-[var(--brand-purple)] shrink-0" />
                <span>Mon–Sat: 10 am – 8 pm &nbsp;·&nbsp; Sun: 11 am – 6 pm</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[var(--brand-purple)] shrink-0" />
                <a href={`tel:${SITE.phone}`} className="hover:text-[var(--brand-darkpink)] transition-colors">{SITE.phone}</a>
              </li>
            </ul>

            <a
              href={SITE.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.2em] uppercase px-6 py-3 rounded-full hover:bg-[var(--brand-darkpink-deep)] transition-colors w-fit"
            >
              <Navigation size={14} /> Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
