'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useReducedMotion } from 'framer-motion'
import SectionHeading from '@/components/common/SectionHeading'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

// Local cutout fallbacks for the seeded categories (used when no image uploaded).
const FALLBACK_IMAGE: Record<string, string> = {
  sarees: '/saree.png',
  'womens-wear': '/womenwear.png',
  'kids-wear': '/kidswear.png',
  kurtas: '/kurta.png',
}

interface Props {
  categories?: Array<Category & { product_count: number }>
  /** 'marquee' = auto-scrolling ribbon (used above the hero); 'grid' = static cards */
  variant?: 'marquee' | 'grid'
  /** show the "Shop by Category" section heading */
  heading?: boolean
}

/**
 * Category discovery cards, shared between two placements:
 *  - variant="marquee": a compact ribbon of arched tiles that glide LEFT→RIGHT in a
 *    seamless CSS-transform loop (GPU only), pause on hover, reduced-motion → static.
 *    Used ABOVE the hero (matches the client's reference video).
 *  - variant="grid": the same arched tiles laid out static & centered — the main
 *    "Shop by Category" section.
 *
 * The marquee is wrapped in overflow-hidden so it never widens the document.
 */
export default function CategoryMarquee({ categories = [], variant = 'marquee', heading = true }: Props) {
  const reduced = useReducedMotion()
  if (categories.length === 0) return null

  const tiles = categories.map((cat) => {
    const image = cat.image_url ?? FALLBACK_IMAGE[cat.slug] ?? '/saree.png'
    return { id: cat.id, name: cat.name, href: `/shop?category=${cat.slug}`, image }
  })

  const size = variant === 'marquee' ? 'sm' : 'md'
  const moving = variant === 'marquee' && !reduced

  return (
    <section
      className={cn(
        'overflow-hidden bg-[var(--brand-sandal-light)]',
        variant === 'marquee' ? 'py-6 sm:py-8' : 'py-14 lg:py-20'
      )}
    >
      {heading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Browse Collections"
            title="Shop by *Category*"
            copy="Curated silks, women's fashion, kids wear and timeless ethnic styles."
          />
        </div>
      )}

      {moving ? (
        // Marquee: build one "half" wide enough to exceed any viewport, then duplicate
        // it — `animate-marquee-x` (reverse) drifts the track LEFT→RIGHT seamlessly.
        (() => {
          const perHalf = Math.max(2, Math.ceil(10 / tiles.length))
          const half = Array.from({ length: perHalf }).flatMap(() => tiles)
          const loop = [...half, ...half]
          return (
            <div className="group relative w-full overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20 bg-gradient-to-r from-[var(--brand-sandal-light)] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20 bg-gradient-to-l from-[var(--brand-sandal-light)] to-transparent" />
              <ul className="animate-marquee-x flex w-max items-stretch gap-4 sm:gap-6 px-3 group-hover:[animation-play-state:paused]">
                {loop.map((t, i) => (
                  <li key={`${t.id}-${i}`} aria-hidden={i !== 0}>
                    <CategoryTile {...t} size={size} />
                  </li>
                ))}
              </ul>
            </div>
          )
        })()
      ) : (
        // Static, centered grid (variant="grid" or reduced-motion).
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {tiles.map((t) => (
              <CategoryTile key={t.id} {...t} size={size} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function CategoryTile({ name, href, image, size = 'md' }: { name: string; href: string; image: string; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 'w-[120px] sm:w-[136px]' : 'w-[150px] sm:w-[178px]'
  const h = size === 'sm' ? 'h-[168px] sm:h-[188px]' : 'h-[210px] sm:h-[248px]'
  const text = size === 'sm' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
  return (
    <Link href={href} className={cn('group/tile block shrink-0', w)} aria-label={`Shop ${name}`}>
      {/* Arched tile — warm cream arch behind the subject, gold name overlaid at the
          bottom (matches the reference). Gold ring + lift on hover. */}
      <div className={cn('relative w-full overflow-hidden rounded-t-[999px] rounded-b-2xl bg-gradient-to-b from-[var(--brand-cream-deep)] to-[var(--brand-sandal)] ring-1 ring-[var(--brand-pink)]/40 transition-all duration-500 group-hover/tile:ring-2 group-hover/tile:ring-[var(--brand-gold)]/70 group-hover/tile:-translate-y-1 group-hover/tile:shadow-[0_20px_40px_-24px_rgba(122,36,64,0.5)]', h)}>
        <Image
          src={image}
          alt={name}
          fill
          sizes="178px"
          className="object-cover object-top transition-transform duration-700 group-hover/tile:scale-105"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <p className={cn('absolute inset-x-0 bottom-0 px-2 pb-3 text-center font-serif font-medium text-[var(--brand-gold-light)] leading-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]', text)}>
          {name}
        </p>
      </div>
    </Link>
  )
}
