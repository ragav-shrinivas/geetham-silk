'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Check, Zap } from 'lucide-react'
import { useStore } from '@/lib/store/StoreProvider'
import WishlistButton from '@/components/common/WishlistButton'
import WhatsAppCTA from '@/components/products/WhatsAppCTA'
import { cn } from '@/lib/utils'
import type { ProductWithImages } from '@/types/database'

export default function ProductActions({ product }: { product: ProductWithImages }) {
  const { addToCart } = useStore()
  const router = useRouter()
  const sizes = product.sizes ?? []
  const tracked = product.track_inventory
  const stock = product.stock_quantity ?? 0
  const oos = product.is_out_of_stock || (tracked && stock <= 0)
  const lowStock = tracked && stock > 0 && stock <= (product.low_stock_threshold ?? 0)
  const [size, setSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  const image = product.product_images?.find((i) => i.is_primary)?.url ?? product.product_images?.[0]?.url ?? null

  const cartItem = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image,
    size,
  }

  function needsSize() {
    if (sizes.length > 0 && !size) { setError('Please select a size'); return true }
    setError('')
    return false
  }

  function handleAdd() {
    if (oos || needsSize()) return
    addToCart(cartItem)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  function handleBuyNow() {
    if (oos || needsSize()) return
    addToCart(cartItem)
    router.push('/checkout')
  }

  return (
    <div className="space-y-5">
      {/* Stock availability */}
      {tracked && (
        <p className={cn(
          'text-xs tracking-[0.15em] uppercase',
          oos ? 'text-gray-400' : lowStock ? 'text-amber-600' : 'text-[#1f9d57]'
        )}>
          {oos ? 'Out of stock' : lowStock ? `Only ${stock} left in stock` : `In stock · ${stock} available`}
        </p>
      )}

      {/* Sizes — selectable */}
      {sizes.length > 0 && (
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3 font-medium">Select Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSize(s); setError('') }}
                aria-pressed={size === s}
                className={cn(
                  'min-w-[48px] min-h-[44px] px-4 border text-sm transition-colors duration-200',
                  size === s
                    ? 'border-[var(--brand-rose)] bg-[var(--brand-rose)] text-white'
                    : 'border-[var(--brand-pink)] text-[var(--brand-charcoal)] hover:border-[var(--brand-rose)]'
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      )}

      {/* Primary actions */}
      {oos ? (
        <div className="space-y-3">
          <div className="w-full min-h-[52px] flex items-center justify-center border border-[var(--brand-charcoal)]/20 text-[var(--brand-charcoal)]/50 text-xs tracking-[0.2em] uppercase">
            Currently Unavailable
          </div>
          <div className="flex gap-3">
            <WishlistButton item={{ ...cartItem, categoryName: product.categories?.name ?? null }} variant="inline" className="flex-1" />
            <WhatsAppCTA product={product} className="flex-1 min-h-[52px]" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 min-h-[52px] border border-[var(--brand-charcoal)] text-[var(--brand-charcoal)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-charcoal)] hover:text-white transition-colors active:scale-[0.99]"
            >
              {added ? <><Check size={16} /> Added</> : <><ShoppingBag size={16} /> Add to Cart</>}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center gap-2 min-h-[52px] bg-[var(--brand-charcoal)] text-white text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-rose)] transition-colors active:scale-[0.99]"
            >
              <Zap size={16} /> Buy Now
            </button>
          </div>
          <div className="flex gap-3">
            <WishlistButton item={{ ...cartItem, categoryName: product.categories?.name ?? null }} variant="inline" className="flex-1" />
            <WhatsAppCTA product={product} className="flex-1 min-h-[52px]" />
          </div>
        </div>
      )}
    </div>
  )
}
