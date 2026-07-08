import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/common/SectionHeading'

/**
 * Shop by Price — discovery tiles that deep-link to the shop with real
 * min/max price query filters (shareable, refresh-safe, server-filtered).
 *
 * Bands are chosen from the live catalogue's actual price spread (₹420 then
 * ₹3k–₹7k) so every band returns products — the empty ₹1.5–2.5k band from the
 * generic template was dropped. Half-open ranges (maxPrice is exclusive) keep
 * each product in exactly one band.
 */
const BANDS = [
  { label: 'Under ₹2,500', href: '/shop?maxPrice=2500' },
  { label: '₹2,500 – ₹5,000', href: '/shop?minPrice=2500&maxPrice=5000' },
  { label: '₹5,000 – ₹7,000', href: '/shop?minPrice=5000&maxPrice=7000' },
  { label: '₹7,000 & Above', href: '/shop?minPrice=7000' },
]

export default function ShopByPrice() {
  return (
    <section className="py-14 lg:py-20 bg-[var(--brand-cream)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Every Budget"
          title="Shop by *Price*"
          copy="Find your next drape at the price that suits you."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {BANDS.map((b, i) => (
            <Link
              key={b.href}
              href={b.href}
              className="group relative overflow-hidden rounded-2xl border border-[var(--brand-pink)]/40 bg-[var(--brand-sandal-light)] px-5 py-7 sm:py-9 flex flex-col items-start justify-between min-h-[128px] sm:min-h-[150px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-24px_rgba(122,36,64,0.5)] hover:border-[var(--brand-darkpink)]/50"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-3 -top-4 font-serif text-[5rem] leading-none text-[var(--brand-gold)]/10 select-none"
              >
                {i + 1}
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[var(--brand-darkpink)] font-medium">
                Sarees
              </span>
              <div className="mt-auto">
                <p className="font-serif text-lg sm:text-2xl font-light text-[var(--brand-charcoal)] leading-tight">
                  {b.label}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase text-[var(--brand-charcoal)]/80 group-hover:text-[var(--brand-darkpink)] transition-colors">
                  Shop now
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
