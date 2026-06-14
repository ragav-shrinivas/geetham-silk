'use client'
import { RevealGroup, RevealItem } from '@/components/common/Reveal'
import SectionHeading from '@/components/common/SectionHeading'
import CategoryCard from '@/components/home/CategoryCard'

// Each cutout has a different aspect ratio (saree 0.70 → width-filling & large;
// kurta 0.30 → tall & narrow), so a single scale can't balance them. Values are
// tuned per image AND per breakpoint (the card is taller/narrower on phones):
//  - `scale`       → desktop presence (Sarees is the visual reference)
//  - `scaleMobile` → phone presence (standing cutouts need a little more height
//                    to balance the wide, seated saree composition)
const CARDS = [
  { title: 'Sarees', slug: 'sarees', image: '/saree.png', scale: 1, scaleMobile: 0.9, objectPosition: '50% 100%' },
  { title: "Women's Wear", slug: 'womens-wear', image: '/womenwear.png', scale: 0.82, scaleMobile: 0.92, objectPosition: '50% 100%' },
  { title: 'Kids Wear', slug: 'kids-wear', image: '/kidswear.png', scale: 0.84, scaleMobile: 0.93, objectPosition: '50% 100%' },
  { title: 'Kurtas', slug: 'kurtas', image: '/kurta.png', scale: 0.86, scaleMobile: 0.95, objectPosition: '50% 100%' },
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
              <CategoryCard image={c.image} title={c.title} href={`/shop?category=${c.slug}`} index={i} scale={c.scale} scaleMobile={c.scaleMobile} objectPosition={c.objectPosition} priority={i === 0} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
