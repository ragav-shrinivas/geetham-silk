'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, X } from 'lucide-react'
import { useStore } from '@/lib/store/StoreProvider'
import { formatPrice } from '@/lib/utils'
import PageNav from '@/components/common/PageNav'

export default function WishlistPage() {
  const { wishlist, ready, removeFromWishlist, moveToCart } = useStore()

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/shop" backLabel="Shop" crumbs={[{ label: 'Wishlist' }]} className="mb-8" />

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[var(--brand-rose)] mb-3">Saved For You</p>
            <h1 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)]">Wishlist</h1>
          </div>
          {ready && wishlist.length > 0 && (
            <p className="text-xs tracking-[0.25em] uppercase text-gray-400 pb-2 tabular-nums">
              {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
            </p>
          )}
        </div>

        {!ready ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[var(--brand-cream-deep)] animate-pulse" />
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-24">
            <Heart size={44} strokeWidth={1} className="mx-auto text-[var(--brand-charcoal)]/20 mb-5" />
            <p className="font-serif text-3xl text-[var(--brand-charcoal)]/60 mb-3">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mb-8">Tap the heart on any piece to save it here.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-rose)] transition-colors">
              Explore the Boutique
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {wishlist.map((it) => (
              <div key={it.id} className="group relative flex flex-col bg-[var(--brand-sandal-light)]">
                <Link href={`/products/${it.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-[var(--brand-cream-deep)]">
                  {it.image ? (
                    <Image src={it.image} alt={it.name} fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-[var(--brand-charcoal)]/20">G</div>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); removeFromWishlist(it.id) }}
                    aria-label="Remove from wishlist"
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[var(--brand-charcoal)] hover:text-red-500 active:scale-90 transition"
                  >
                    <X size={15} />
                  </button>
                </Link>
                <div className="p-3 flex flex-col flex-1">
                  {it.categoryName && <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--brand-rose)] mb-1 font-medium">{it.categoryName}</span>}
                  <Link href={`/products/${it.slug}`}>
                    <h3 className="font-serif text-base font-light text-[var(--brand-charcoal)] leading-snug line-clamp-2 hover:text-[var(--brand-rose)] transition-colors">{it.name}</h3>
                  </Link>
                  <span className="font-serif text-lg font-semibold text-[var(--brand-charcoal)] mt-1">{formatPrice(it.price)}</span>
                  <button
                    onClick={() => moveToCart(it.id)}
                    className="mt-3 inline-flex items-center justify-center gap-2 min-h-[44px] bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.18em] uppercase hover:bg-[var(--brand-rose)] active:scale-[0.98] transition"
                  >
                    <ShoppingBag size={14} /> Move to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
