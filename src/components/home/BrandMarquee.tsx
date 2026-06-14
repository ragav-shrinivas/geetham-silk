'use client'

const DEFAULT_ITEMS = ['Pure Silk', 'Handpicked', 'Bridal Collection', 'Kids Ethnic', 'Designer Kurtas', 'Kanchipuram', 'Soft Silks', 'New Arrivals']

export default function BrandMarquee({ items = DEFAULT_ITEMS }: { items?: string[] }) {
  const row = [...items, ...items]
  return (
    <div className="bg-[var(--brand-charcoal)] py-5 overflow-hidden">
      <div className="flex animate-marquee">
        {row.map((item, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <span className="font-serif text-2xl italic text-white/80 px-8">{item}</span>
            <span className="text-[var(--brand-pink)] text-lg">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}
