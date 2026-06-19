import { MapPin, Navigation, Clock, Phone } from 'lucide-react'
import MapCard from '@/components/common/MapCard'
import SectionHeading from '@/components/common/SectionHeading'
import { SITE } from '@/lib/constants'

/** "Visit Our Store" — map preview + address card with a Directions CTA. */
export default function StoreLocation() {
  return (
    <section className="py-16 lg:py-24 bg-[var(--brand-babypink)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Find Us"
          title="Visit Our *Store*"
          copy="Step into the boutique in Palavakkam — explore the collection in person."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
          {/* Map preview (clickable → Google Maps) */}
          <MapCard className="h-full min-h-[260px] rounded-2xl" />

          {/* Store details card */}
          <div className="bg-white rounded-2xl border border-[var(--brand-pink)]/30 p-7 lg:p-9 flex flex-col justify-center shadow-sm">
            <h3 className="font-serif text-2xl lg:text-3xl font-light text-[var(--brand-charcoal)] mb-1">Geethams Silks</h3>
            <p className="text-sm tracking-[0.18em] uppercase text-[var(--brand-darkpink)] mb-6">Palavakkam · Chennai</p>

            <ul className="space-y-4 text-sm text-gray-600 mb-8">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[var(--brand-purple)] shrink-0 mt-0.5" />
                <span>388, Periyar Salai, Krishna Nagar, Palavakkam, Chennai, Tamil Nadu 600041</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-[var(--brand-purple)] shrink-0" />
                <span>Mon–Sat: 10am – 8pm · Sun: 11am – 6pm</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[var(--brand-purple)] shrink-0" />
                <a href={`tel:${SITE.phone}`} className="hover:text-[var(--brand-darkpink)] transition-colors">{SITE.phone}</a>
              </li>
            </ul>

            <a
              href={SITE.maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 rounded-full hover:bg-[var(--brand-darkpink-deep)] transition-colors w-fit"
            >
              <Navigation size={15} /> Get Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
