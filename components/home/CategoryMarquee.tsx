'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useReducedMotion } from 'framer-motion'
import SectionHeading from '@/components/common/SectionHeading'
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
}

/**
 * Moving category discovery rail — categories glide continuously left→right in a
 * seamless CSS marquee (the list is duplicated so the loop never jumps). Uses a
 * GPU transform only, so it stays smooth on low-end devices.
 *
 * - Wrapped in `overflow-hidden`: the animation never widens the document or adds
 *   a horizontal scrollbar (page stays vertically scrolling).
 * - Pauses on hover (desktop). Respects prefers-reduced-motion: motion users get a
 *   static, centered wrapping grid instead of the marquee.
 * - Each tile is a real category linking to its filtered shop result.
 */
export default function CategoryMarquee({ categories = [] }: Props) {
  const reduced = useReducedMotion()
  if (categories.length === 0) return null

  const tiles = categories.map((cat) => {
    const image = cat.image_url ?? FALLBACK_IMAGE[cat.slug] ?? '/saree.png'
    return { id: cat.id, name: cat.name, href: `/shop?category=${cat.slug}`, image, count: cat.product_count }
  })

  return (
    <section className="py-14 lg:py-20 bg-[var(--brand-sandal-light)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse Collections"
          title="Shop by *Category*"
          copy="Curated silks, women's fashion, kids wear and timeless ethnic styles."
        />
      </div>

      {reduced ? (
        // Reduced-motion: static, centered, wrapping — no animation.
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {tiles.map((t) => (
              <CategoryTile key={t.id} {...t} />
            ))}
          </div>
        </div>
      ) : (
        // Marquee: build one "half" wide enough to exceed any viewport (repeat the
        // real tiles), then duplicate the half — translateX(-50%) loops seamlessly.
        (() => {
          const perHalf = Math.max(2, Math.ceil(10 / tiles.length))
          const half = Array.from({ length: perHalf }).flatMap(() => tiles)
          const loop = [...half, ...half]
          return (
            <div className="group relative w-full overflow-hidden">
              {/* soft edge fades */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20 bg-gradient-to-r from-[var(--brand-sandal-light)] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20 bg-gradient-to-l from-[var(--brand-sandal-light)] to-transparent" />
              <ul className="animate-marquee-x flex w-max items-stretch gap-4 sm:gap-6 px-3 group-hover:[animation-play-state:paused]">
                {loop.map((t, i) => (
                  <li key={`${t.id}-${i}`} aria-hidden={i !== 0}>
                    <CategoryTile {...t} />
                  </li>
                ))}
              </ul>
            </div>
          )
        })()
      )}
    </section>
  )
}

function CategoryTile({ name, href, image }: { name: string; href: string; image: string; count?: number }) {
  return (
    <Link
      href={href}
      className="group/tile block w-[150px] sm:w-[178px] shrink-0"
      aria-label={`Shop ${name}`}
    >
      {/* Arched tile — warm cream arch behind the subject, gold name overlaid at the
          bottom (matches the reference). Gold ring + lift on hover. */}
      <div className="relative h-[210px] sm:h-[248px] w-full overflow-hidden rounded-t-[999px] rounded-b-2xl bg-gradient-to-b from-[var(--brand-cream-deep)] to-[var(--brand-sandal)] ring-1 ring-[var(--brand-pink)]/40 transition-all duration-500 group-hover/tile:ring-2 group-hover/tile:ring-[var(--brand-gold)]/70 group-hover/tile:-translate-y-1 group-hover/tile:shadow-[0_20px_40px_-24px_rgba(122,36,64,0.5)]">
        <Image
          src={image}
          alt={name}
          fill
          sizes="178px"
          className="object-cover object-top transition-transform duration-700 group-hover/tile:scale-105"
        />
        {/* scrim so the gold name stays legible over any photo */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <p className="absolute inset-x-0 bottom-0 px-2 pb-3.5 text-center font-serif text-lg sm:text-xl font-medium text-[var(--brand-gold-light)] leading-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
          {name}
        </p>
      </div>
    </Link>
  )
}
