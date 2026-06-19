'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, MessageCircle, Check, ShoppingBag } from 'lucide-react'
import SectionHeading from '@/components/common/SectionHeading'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { LUXE } from '@/lib/motion'
import type { ProductWithImages } from '@/types/database'

interface Props { products: ProductWithImages[] }

/** Fisher-Yates in-place shuffle (mutates a copy) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ProductDiscovery({ products }: Props) {
  const [shuffled, setShuffled] = useState<ProductWithImages[]>([])
  const reduced = useReducedMotion()

  // Shuffle on every client mount → different order on each page load
  useEffect(() => {
    setShuffled(shuffle(products))
  }, [products])

  if (!products.length) return null

  // Show 12 on initial render (server gives us 24 so there's always variety)
  const visible = shuffled.slice(0, 12)

  return (
    <section className="py-24 lg:py-32 bg-[var(--brand-cream)] relative overflow-hidden">
      <span aria-hidden className="backdrop-word top-10">Explore</span>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="All Categories"
          title="Explore Our *Collection*"
          backdropWord=""
          copy="Discover pieces from every category — sarees, women's wear, kids ethnic and kurtas — curated for every occasion."
        />

        {/* True ecommerce grid — vertical scroll, no carousel.
            Mobile: 2-col · SM: 3-col · LG: 4-col · XL: 5-col */}
        {shuffled.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12">
            {visible.map((product, i) => (
              <DiscoveryCard key={product.id} product={product} index={i} reduced={!!reduced} />
            ))}
          </div>
        ) : (
          /* SSR placeholder — same grid but empty cards to prevent layout shift */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-10 lg:gap-x-6 lg:gap-y-12">
            {products.slice(0, 10).map((p) => (
              <div key={p.id} className="aspect-[3/4] bg-[var(--brand-cream-deep)] animate-pulse rounded-sm" />
            ))}
          </div>
        )}

        {/* Browse all CTA */}
        <div className="mt-14 flex justify-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-3 border border-[var(--brand-charcoal)] text-[var(--brand-charcoal)] text-[11px] tracking-[0.28em] uppercase px-10 py-4 hover:bg-[var(--brand-darkpink)] hover:text-white transition-all duration-500"
          >
            <ShoppingBag size={14} className="transition-transform duration-300 group-hover:scale-110" />
            Browse Full Collection
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function DiscoveryCard({ product, index, reduced }: { product: ProductWithImages; index: number; reduced: boolean }) {
  const img = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0]
  const href = `/products/${product.slug}`
  const whatsappUrl = buildWhatsAppUrl(product)
  const oos = product.is_out_of_stock
  const discount =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null

  // Subtle mouse parallax on the card image
  const cardRef = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 20, mass: 0.5 })
  const sy = useSpring(my, { stiffness: 80, damping: 20, mass: 0.5 })

  function onMove(e: React.MouseEvent) {
    if (reduced) return
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 10)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 8)
  }
  function onLeave() { mx.set(0); my.set(0) }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-6% 0px' }}
      transition={{ duration: 0.65, ease: LUXE, delay: (index % 5) * 0.07 }}
      className="group relative flex flex-col h-full"
    >
      {/* Image */}
      <Link
        href={href}
        className="relative block aspect-[3/4] overflow-hidden bg-[var(--brand-cream-deep)] shadow-[0_12px_32px_-16px_rgba(44,44,44,0.35)] transition-shadow duration-700 group-hover:shadow-[0_24px_52px_-16px_rgba(201,116,122,0.38)]"
      >
        <motion.div style={{ x: sx, y: sy }} className="absolute inset-0 will-change-transform">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt_text ?? product.name}
              fill
              sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 20vw"
              className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--brand-cream)] to-[var(--brand-pink)]/20 flex items-center justify-center">
              <span className="font-serif text-5xl text-[var(--brand-charcoal)]/20">G</span>
            </div>
          )}
        </motion.div>

        {/* Discount badge */}
        {discount && !oos && (
          <span className="absolute top-3 right-3 bg-[var(--brand-rose)] text-white text-[10px] tracking-[0.1em] uppercase px-2.5 py-1">
            {discount}% off
          </span>
        )}

        {/* OOS ribbon */}
        {oos && (
          <div className="absolute inset-0 bg-[var(--brand-darkpink)]/30 flex items-start justify-center pt-5">
            <span className="bg-white/95 text-[var(--brand-charcoal)] text-[10px] tracking-[0.25em] uppercase px-4 py-1.5">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover WhatsApp (in-stock only) */}
        {!oos && (
          <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => { e.preventDefault(); window.open(whatsappUrl, '_blank', 'noopener') }}
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-[11px] tracking-[0.18em] uppercase px-4 py-2.5 shadow-lg hover:bg-[#128C7E] transition-colors cursor-pointer"
            >
              <MessageCircle size={13} /> Enquire
            </span>
          </div>
        )}

        {/* Gold accent line */}
        <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[var(--brand-gold)] group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
      </Link>

      {/* Card info */}
      <div className="pt-3.5 flex flex-col flex-1">
        {product.categories && (
          <span className="text-[10px] tracking-[0.22em] uppercase text-[var(--brand-rose)] mb-1 font-medium">
            {product.categories.name}
          </span>
        )}
        <Link href={href}>
          <h3 className="font-serif text-base lg:text-lg font-light text-[var(--brand-charcoal)] leading-snug line-clamp-2 group-hover:text-[var(--brand-rose)] transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-serif text-lg font-semibold text-[var(--brand-charcoal)]">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>

        <span className={`mt-1.5 inline-flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase ${oos ? 'text-gray-400' : 'text-[#1f9d57]'}`}>
          {oos ? 'Unavailable' : <><Check size={11} /> In Stock</>}
        </span>

        <Link
          href={href}
          className="mt-3 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-[var(--brand-charcoal)] border-b border-[var(--brand-charcoal)]/20 hover:border-[var(--brand-rose)] hover:text-[var(--brand-rose)] pb-1 w-fit transition-colors duration-300"
        >
          View Details
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-300" />
        </Link>
      </div>
    </motion.div>
  )
}
