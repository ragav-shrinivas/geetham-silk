'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '@/components/common/SectionHeading'
import ProductCard from '@/components/products/ProductCard'
import type { ProductWithImages } from '@/types/database'

gsap.registerPlugin(ScrollTrigger)

interface Props { products: ProductWithImages[] }

/**
 * New arrivals as a pinned horizontal rail: the section holds while the
 * pieces travel sideways with scroll. Falls back to a swipe carousel on
 * touch/small screens and for reduced-motion users.
 */
export default function NewArrivals({ products }: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const section = sectionRef.current
      const track = trackRef.current
      if (!section || !track || products.length === 0) return

      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => Math.max(0, track.scrollWidth - section.clientWidth)
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        return () => {
          tween.scrollTrigger?.kill()
          tween.kill()
        }
      })
      return () => mm.revert()
    },
    { dependencies: [products.length], scope: sectionRef }
  )

  if (products.length === 0) return null

  return (
    <section ref={sectionRef} className="relative bg-[var(--brand-sandal-light)] py-24 lg:py-0 lg:h-screen lg:flex lg:flex-col lg:justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionHeading
          variant="split"
          eyebrow="Just In"
          title="New *Arrivals*"
          backdropWord="Nouveau"
          aside={
            <Link
              href="/shop?new=true"
              className="link-underline text-xs tracking-[0.2em] uppercase text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors"
            >
              View All
            </Link>
          }
          className="mb-10 lg:mb-12"
        />
      </div>

      {/* Rail — translated by scroll on desktop; swipe carousel below lg */}
      <div className="overflow-x-auto lg:overflow-visible no-scrollbar snap-x snap-mandatory lg:snap-none">
        <div
          ref={trackRef}
          className="flex gap-4 lg:gap-6 px-4 sm:px-6 lg:px-8 will-change-transform w-max"
        >
          {products.map((product, i) => (
            <div
              key={product.id}
              className="w-[68vw] sm:w-[42vw] lg:w-[24vw] xl:w-[21vw] shrink-0 snap-center"
            >
              <div className="flex flex-col h-full">
                <span className="font-serif text-sm text-[var(--brand-gold)] tabular-nums mb-2">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <ProductCard product={product} animate={false} />
              </div>
            </div>
          ))}

          {/* rail end-cap */}
          <Link
            href="/shop?new=true"
            className="group w-[50vw] sm:w-[30vw] lg:w-[18vw] shrink-0 flex flex-col items-center justify-center gap-4 border border-[var(--brand-pink)]/40 text-[var(--brand-charcoal)] hover:bg-[var(--brand-cream)] transition-colors duration-500 min-h-[320px]"
          >
            <span className="font-serif text-2xl lg:text-3xl font-light italic">View all</span>
            <span className="text-[11px] tracking-[0.3em] uppercase text-[var(--brand-rose)] group-hover:tracking-[0.4em] transition-all duration-500">
              New Arrivals →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
