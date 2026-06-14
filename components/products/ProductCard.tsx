'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import type { ProductWithImages } from '@/types/database'

interface ProductCardProps {
  product: ProductWithImages
  /** set false when an outer Reveal/RevealItem already handles entrance motion */
  animate?: boolean
}

export default function ProductCard({ product, animate = true }: ProductCardProps) {
  const primaryImage = product.product_images?.find((i) => i.is_primary) ?? product.product_images?.[0]
  const secondaryImage = product.product_images?.[1]
  const whatsappUrl = buildWhatsAppUrl(product)

  const entrance = animate
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { margin: '-8% 0px -8% 0px' },
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
      }
    : {}

  return (
    <motion.div
      {...entrance}
      className="product-card group relative bg-white flex flex-col"
    >
      {/* Image container */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] bg-gray-50">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="product-card-img object-cover"
            />
            {secondaryImage && (
              <Image
                src={secondaryImage.url}
                alt={secondaryImage.alt_text ?? product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="product-card-img object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--brand-cream)] to-[var(--brand-pink)]/20 flex items-center justify-center">
            <span className="text-[var(--brand-charcoal)]/30 text-4xl font-serif">G</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new_arrival && <Badge variant="rose">New</Badge>}
          {product.is_trending && <Badge variant="gold">Trending</Badge>}
          {product.is_out_of_stock && <Badge variant="default">Sold Out</Badge>}
          {product.original_price && product.original_price > product.price && (
            <Badge variant="pink">
              {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
            </Badge>
          )}
        </div>

        {/* Quick WhatsApp hover overlay */}
        <div className="absolute inset-0 bg-[var(--brand-charcoal)]/0 group-hover:bg-[var(--brand-charcoal)]/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 bg-[#25D366] text-white text-xs tracking-widest uppercase px-4 py-2.5 hover:bg-[#128C7E] transition-colors shadow-lg"
          >
            <MessageCircle size={14} />
            Enquire
          </a>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.categories && (
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--brand-rose)] mb-1 font-medium">
            {product.categories.name}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-lg font-medium text-[var(--brand-charcoal)] leading-tight hover:text-[var(--brand-rose)] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 tracking-wider mt-0.5">#{product.product_code}</p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-semibold text-[var(--brand-charcoal)]">
              {formatPrice(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
