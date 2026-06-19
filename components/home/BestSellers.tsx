'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, MessageCircle, Check } from 'lucide-react'
import SectionHeading from '@/components/common/SectionHeading'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { LUXE } from '@/lib/motion'
import type { ProductWithImages } from '@/types/database'

interface Props { products: ProductWithImages[] }

/**
 * Best Selling Products — the boutique's most-requested pieces.
 * Desktop: an editorial 4-up grid. Mobile: a swipeable carousel that peeks
 * the next card to invite interaction. Admin-controlled via is_best_seller.
 */
export default function BestSellers({ products }: Props) {
  if (products.length === 0) return null

  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <span aria-hidden className="backdrop-word top-10">Bestsellers</span>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Most Loved"
          title="Best Selling *Products*"
          copy="Our most loved and frequently requested collections."
        />

        {/* mobile: peek carousel · desktop: grid */}
        <div className="flex lg:grid lg:grid-cols-4 gap-5 lg:gap-7 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:pb-0">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="snap-center shrink-0 w-[78%] sm:w-[44%] lg:w-auto"
            >
              <BestSellerCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BestSellerCard({ product, index }: { product: ProductWithImages; index: number }) {
  const reduced = useReducedMotion()
  const img = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0]
  const href = `/products/${product.slug}`
  const whatsappUrl = buildWhatsAppUrl(product)
  const oos = product.is_out_of_stock
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.7, ease: LUXE, delay: (index % 4) * 0.08 }}
      className="group relative flex flex-col h-full bg-white"
    >
      {/* Image */}
      <Link
        href={href}
        className="relative block aspect-[3/4] overflow-hidden bg-[var(--brand-cream-deep)] shadow-[0_18px_40px_-22px_rgba(44,44,44,0.45)] transition-shadow duration-700 group-hover:shadow-[0_30px_60px_-20px_rgba(201,116,122,0.4)]"
      >
        {img ? (
          <Image
            src={img.url}
            alt={img.alt_text ?? product.name}
            fill
            sizes="(max-width: 1024px) 78vw, 25vw"
            className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--brand-cream)] to-[var(--brand-pink)]/25 flex items-center justify-center">
            <span className="font-serif text-5xl text-[var(--brand-charcoal)]/25">G</span>
          </div>
        )}

        {/* rank + status badges */}
        <span className="absolute top-3 left-3 inline-flex items-center justify-center w-7 h-7 bg-[var(--brand-darkpink)]/85 backdrop-blur-sm text-white text-[11px] font-serif tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {discount && !oos && (
            <span className="bg-[var(--brand-rose)] text-white text-[10px] tracking-[0.1em] uppercase px-2.5 py-1">{discount}% off</span>
          )}
        </div>

        {/* availability ribbon for out-of-stock (kept visible — admin decides) */}
        {oos && (
          <div className="absolute inset-0 bg-[var(--brand-darkpink)]/35 flex items-start justify-center pt-5">
            <span className="bg-white/95 text-[var(--brand-charcoal)] text-[10px] tracking-[0.25em] uppercase px-4 py-1.5">Out of Stock</span>
          </div>
        )}

        {/* hover WhatsApp enquire (in-stock only) */}
        {!oos && (
          <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => { e.preventDefault(); window.open(whatsappUrl, '_blank', 'noopener') }}
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-[11px] tracking-[0.18em] uppercase px-4 py-2.5 shadow-lg hover:bg-[#128C7E] transition-colors"
            >
              <MessageCircle size={13} /> Enquire
            </span>
          </div>
        )}

        {/* gold accent line */}
        <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[var(--brand-gold)] group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
      </Link>

      {/* Info */}
      <div className="pt-4 flex flex-col flex-1">
        {product.categories && (
          <span className="text-[10px] tracking-[0.22em] uppercase text-[var(--brand-rose)] mb-1.5 font-medium">
            {product.categories.name}
          </span>
        )}
        <Link href={href}>
          <h3 className="font-serif text-lg lg:text-xl font-light text-[var(--brand-charcoal)] leading-snug line-clamp-2 group-hover:text-[var(--brand-rose)] transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-serif text-xl font-semibold text-[var(--brand-charcoal)]">{formatPrice(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>

        {/* availability status line */}
        <span className={`mt-2 inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase ${oos ? 'text-gray-400' : 'text-[#1f9d57]'}`}>
          {oos ? 'Currently Unavailable' : (<><Check size={12} /> In Stock</>)}
        </span>

        <Link
          href={href}
          className="mt-3.5 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[var(--brand-charcoal)] border-b border-[var(--brand-charcoal)]/20 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] pb-1 w-fit transition-colors duration-300"
        >
          View Details
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </motion.div>
  )
}
