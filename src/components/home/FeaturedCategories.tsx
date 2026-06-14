'use client'
import { RevealGroup, RevealItem } from '@/components/common/Reveal'
import SectionHeading from '@/components/common/SectionHeading'
import CategoryCard from '@/components/home/CategoryCard'

// `scale` normalises each model's visual height — Sarees (wider crop) is the
// 1.0 reference; the narrower cutouts are scaled down to match its presence.
const CARDS = [
  { title: 'Sarees', slug: 'sarees', image: '/saree.png', scale: 1 },
  { title: "Women's Wear", slug: 'womens-wear', image: '/womenwear.png', scale: 0.8 },
  { title: 'Kids Wear', slug: 'kids-wear', image: '/kidswear.png', scale: 0.8 },
  { title: 'Kurtas', slug: 'kurtas', image: '/kurta.png', scale: 0.8 },
]

export default function FeaturedCategories() {
  return (
    <section className="py-24 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial heading */}
        <SectionHeading
          eyebrow="Browse Collections"
          title="Discover Our Signature *Collections*"
          backdropWord="Signature"
          copy="Curated silk sarees, women's fashion, kids wear and timeless ethnic styles crafted with elegance."
        />

        {/* Cards: 4-col desktop · 2-col tablet · swipe carousel on mobile */}
        <RevealGroup
          stagger={0.14}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0"
        >
          {CARDS.map((c, i) => (
            <RevealItem
              key={c.slug}
              direction="up"
              distance={60}
              className="snap-center shrink-0 w-[80%] sm:w-auto"
            >
              <CategoryCard image={c.image} title={c.title} href={`/shop?category=${c.slug}`} index={i} scale={c.scale} priority={i === 0} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
