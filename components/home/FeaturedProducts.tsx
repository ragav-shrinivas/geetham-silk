'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import SectionHeading from '@/components/common/SectionHeading'
import ProductCard from '@/components/products/ProductCard'
import { RevealGroup, RevealItem } from '@/components/common/Reveal'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { LUXE } from '@/lib/motion'
import type { ProductWithImages } from '@/types/database'

interface Props { products: ProductWithImages[] }

/**
 * Editorial featured layout: the lead piece runs oversized beside a
 * supporting grid — a magazine spread, not a catalog row.
 */
export default function FeaturedProducts({ products }: Props) {
  const reduced = useReducedMotion()
  if (products.length === 0) return null

  const [lead, ...rest] = products
  const supporting = rest.slice(0, 4)

  return (
    <section className="py-24 lg:py-32 bg-[var(--brand-cream)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          variant="split"
          eyebrow="Handpicked"
          title="Featured *Picks*"
          backdropWord="Featured"
          aside={
            <Link
              href="/shop?featured=true"
              className="link-underline text-xs tracking-[0.2em] uppercase text-[var(--brand-charcoal)] hover:text-[var(--brand-rose)] transition-colors"
            >
              View All
            </Link>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          {/* Lead piece — oversized editorial card */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1, ease: LUXE }}
            className="lg:col-span-3"
          >
            <LeadCard product={lead} />
          </motion.div>

          {/* Supporting grid */}
          <RevealGroup stagger={0.1} className="lg:col-span-2 grid grid-cols-2 gap-4 lg:gap-5">
            {supporting.map((product) => (
              <RevealItem key={product.id} direction="up" distance={40}>
                <ProductCard product={product} animate={false} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}

function LeadCard({ product }: { product: ProductWithImages }) {
  const img = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0]
  const whatsappUrl = buildWhatsAppUrl(product)

  return (
    <div className="group relative h-full min-h-[460px] lg:min-h-[640px] overflow-hidden bg-[var(--brand-darkpink)]">
      {img ? (
        <Image
          src={img.url}
          alt={img.alt_text ?? product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover transition-transform duration-[1.6s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#342a2b] via-[#5a3a41] to-[#714a50]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

      {/* editorial caption block */}
      <div className="absolute inset-x-0 bottom-0 p-8 lg:p-12">
        <p className="text-[11px] tracking-[0.35em] uppercase text-[var(--brand-gold)] mb-3">
          {product.categories?.name ?? 'Signature'} — Edit
        </p>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="font-serif text-3xl lg:text-5xl font-light text-white leading-[1.08] max-w-md group-hover:text-[var(--brand-pink)] transition-colors duration-500">
            {product.name}
          </h3>
        </Link>
        <div className="mt-5 flex flex-wrap items-center gap-6">
          <span className="font-serif text-2xl text-white">{formatPrice(product.price)}</span>
          <div className="flex items-center gap-3">
            <Link
              href={`/products/${product.slug}`}
              className="group/btn inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-white/85 hover:text-white border-b border-white/30 hover:border-[var(--brand-gold)] pb-1 transition-colors duration-300"
            >
              Discover
              <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white text-[11px] tracking-[0.2em] uppercase px-4 py-2.5 hover:bg-[#128C7E] transition-colors"
            >
              <MessageCircle size={13} />
              Enquire
            </a>
          </div>
        </div>
      </div>

      {/* gold accent line */}
      <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[var(--brand-gold)] group-hover:w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
    </div>
  )
}
