'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatPrice, buildWhatsAppUrl } from '@/lib/utils'
import { useStore } from '@/lib/store/StoreProvider'
import WishlistButton from '@/components/common/WishlistButton'
import AddToCartButton from '@/components/cart/AddToCartButton'
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
  const { openQuickView } = useStore()

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
      className="product-card group relative bg-[var(--brand-sandal-light)] flex flex-col"
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

        {/* Wishlist heart — top-right, always tappable */}
        <div className="absolute top-2.5 right-2.5 z-10" onClick={(e) => e.preventDefault()}>
          <WishlistButton
            item={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: primaryImage?.url ?? null,
              categoryName: product.categories?.name ?? null,
            }}
          />
        </div>

        {/* Hover overlay — Quick View + Enquire (buttons, not <a>, to avoid nesting in the card Link) */}
        <div className="absolute inset-0 bg-[var(--brand-darkpink)]/0 group-hover:bg-[var(--brand-darkpink)]/20 transition-all duration-300 flex items-end justify-center gap-2 pb-4 opacity-0 group-hover:opacity-100">
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickView(product) }}
            className="flex items-center gap-1.5 bg-white text-[var(--brand-charcoal)] text-[11px] tracking-widest uppercase px-3.5 py-2.5 hover:bg-[var(--brand-rose)] hover:text-white transition-colors shadow-lg cursor-pointer"
          >
            <Eye size={14} />
            Quick View
          </span>
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(whatsappUrl, '_blank', 'noopener') }}
            className="flex items-center gap-1.5 bg-[#25D366] text-white text-[11px] tracking-widest uppercase px-3.5 py-2.5 hover:bg-[#128C7E] transition-colors shadow-lg cursor-pointer"
          >
            <MessageCircle size={14} />
            Enquire
          </span>
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

        {/* Status badges — kept off the photo so the product is never obscured */}
        {(product.is_new_arrival || product.is_trending || product.is_out_of_stock ||
          (product.original_price && product.original_price > product.price)) && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {product.is_new_arrival && <Badge variant="rose">New</Badge>}
            {product.is_trending && <Badge variant="gold">Trending</Badge>}
            {product.is_out_of_stock && <Badge variant="default">Sold Out</Badge>}
            {product.original_price && product.original_price > product.price && (
              <Badge variant="pink">
                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
              </Badge>
            )}
          </div>
        )}

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

        <AddToCartButton
          size="compact"
          disabled={product.is_out_of_stock}
          className="mt-3"
          item={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: primaryImage?.url ?? null,
            size: null,
          }}
        />
      </div>
    </motion.div>
  )
}
