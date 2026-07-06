import { RevealGroup, RevealItem } from '@/components/common/Reveal'
import SectionHeading from '@/components/common/SectionHeading'
import CategoryCard from '@/components/home/CategoryCard'
import type { Category } from '@/types/database'

// Fallback local images for the 4 default categories (used when admin hasn't uploaded an image).
const FALLBACK_IMAGE: Record<string, string> = {
  sarees:       '/saree.png',
  'womens-wear':'/womenwear.png',
  'kids-wear':  '/kidswear.png',
  kurtas:       '/kurta.png',
}

// Per-image scale values tuned for the original cutout compositions.
const SCALE_MAP: Record<string, { scale: number; scaleMobile: number; objectPosition: string }> = {
  sarees:        { scale: 1,    scaleMobile: 0.9,  objectPosition: '50% 100%' },
  'womens-wear': { scale: 0.82, scaleMobile: 0.92, objectPosition: '50% 100%' },
  'kids-wear':   { scale: 0.84, scaleMobile: 0.93, objectPosition: '50% 100%' },
  kurtas:        { scale: 0.86, scaleMobile: 0.95, objectPosition: '50% 100%' },
}
const DEFAULT_SCALE = { scale: 0.85, scaleMobile: 0.9, objectPosition: '50% 100%' }

interface Props {
  categories?: Array<Category & { product_count: number }>
}

export default function FeaturedCategories({ categories = [] }: Props) {
  return (
    <section className="py-24 lg:py-28 bg-[var(--brand-sandal-light)] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse Collections"
          title="Discover Our Signature *Collections*"
          backdropWord="Signature"
          copy="Curated silk sarees, women's fashion, kids wear and timeless ethnic styles crafted with elegance."
        />

        {/* Cards: vertical responsive grid — 2-col mobile · 2-col tablet · 4-col desktop (no side-swipe) */}
        <RevealGroup
          stagger={0.14}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          {categories.map((cat, i) => {
            const img = cat.image_url ?? FALLBACK_IMAGE[cat.slug] ?? '/saree.png'
            const { scale, scaleMobile, objectPosition } = SCALE_MAP[cat.slug] ?? DEFAULT_SCALE
            return (
              <RevealItem
                key={cat.id}
                direction="up"
                distance={60}
              >
                <CategoryCard
                  image={img}
                  title={cat.name}
                  href={`/shop?category=${cat.slug}`}
                  index={i}
                  count={cat.product_count}
                  scale={scale}
                  scaleMobile={scaleMobile}
                  objectPosition={objectPosition}
                  priority={i === 0}
                />
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}
