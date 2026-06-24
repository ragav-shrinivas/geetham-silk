'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import SectionHeading from '@/components/common/SectionHeading'
import ProductCard from '@/components/products/ProductCard'
import type { ProductWithImages } from '@/types/database'

interface Props {
  products: ProductWithImages[]
  eyebrow: string
  title: string            // wrap an accent word in *asterisks*
  backdropWord?: string
  viewAllHref?: string
  tone?: 'cream' | 'white'
}

/** Reusable product carousel rail (mobile peek + responsive grid). */
export default function ProductRail({ products, eyebrow, title, backdropWord, viewAllHref, tone = 'white' }: Props) {
  if (!products.length) return null
  return (
    <section className={`py-20 lg:py-28 relative overflow-hidden ${tone === 'cream' ? 'bg-[var(--brand-cream)]' : 'bg-[var(--brand-sandal-light)]'}`}>
      {backdropWord && <span aria-hidden className="backdrop-word top-10">{backdropWord}</span>}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          variant="split"
          eyebrow={eyebrow}
          title={title}
          aside={viewAllHref ? (
            <Link href={viewAllHref} className="link-underline text-xs tracking-[0.2em] uppercase text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors inline-flex items-center gap-1.5">
              View All <ArrowRight size={13} />
            </Link>
          ) : undefined}
        />
        <div className="flex lg:grid lg:grid-cols-4 gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:pb-0">
          {products.slice(0, 8).map((p) => (
            <div key={p.id} className="snap-center shrink-0 w-[68vw] sm:w-[44%] lg:w-auto">
              <ProductCard product={p} animate={false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
