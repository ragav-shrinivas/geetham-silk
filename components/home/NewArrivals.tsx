import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/common/SectionHeading'
import ProductCard from '@/components/products/ProductCard'
import type { ProductWithImages } from '@/types/database'

interface Props { products: ProductWithImages[] }

/**
 * New Arrivals — clean vertical grid (2-col mobile · 4-col desktop).
 * The former pinned horizontal scroll-rail was removed: it required sideways
 * browsing + scroll-hijacking, both of which the storefront now avoids.
 */
export default function NewArrivals({ products }: Props) {
  if (products.length === 0) return null

  return (
    <section className="relative bg-[var(--brand-sandal-light)] py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionHeading
          variant="split"
          eyebrow="Just In"
          title="New *Arrivals*"
          aside={
            <Link
              href="/shop?sort=newest"
              className="link-underline text-xs tracking-[0.2em] uppercase text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors inline-flex items-center gap-1.5"
            >
              View All <ArrowRight size={13} />
            </Link>
          }
          className="mb-8 lg:mb-12"
        />

        {/* Vertical responsive grid — no side-swipe, no scroll-hijack */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} animate={false} />
          ))}
        </div>
      </div>
    </section>
  )
}
