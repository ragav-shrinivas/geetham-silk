'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { useStore } from '@/lib/store/StoreProvider'
import { formatPrice } from '@/lib/utils'
import PageNav from '@/components/common/PageNav'

export default function CartPage() {
  const { cart, ready, cartTotal, cartCount, setQty, removeFromCart } = useStore()
  const router = useRouter()

  return (
    <div className="pt-24 min-h-screen bg-[var(--brand-cream)] pb-24 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageNav fallback="/shop" backLabel="Shop" crumbs={[{ label: 'Shopping Bag' }]} className="mb-8" />

        <h1 className="font-serif text-4xl lg:text-5xl font-light text-[var(--brand-charcoal)] mb-10">
          Shopping Bag {ready && cartCount > 0 && <span className="text-xl text-[var(--brand-rose)]">({cartCount})</span>}
        </h1>

        {!ready ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-[var(--brand-cream-deep)] animate-pulse" />)}</div>
        ) : cart.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={44} strokeWidth={1} className="mx-auto text-[var(--brand-charcoal)]/20 mb-5" />
            <p className="font-serif text-3xl text-[var(--brand-charcoal)]/60 mb-3">Your bag is empty</p>
            <p className="text-sm text-gray-400 mb-8">Discover something beautiful to add.</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[var(--brand-darkpink)] text-white text-[11px] tracking-[0.22em] uppercase px-8 py-4 hover:bg-[var(--brand-rose)] transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* line items */}
            <div className="lg:col-span-2 divide-y divide-[var(--brand-pink)]/30 border-y border-[var(--brand-pink)]/30">
              {cart.map((it) => (
                <div key={`${it.id}-${it.size ?? ''}`} className="flex gap-4 py-5">
                  <Link href={`/products/${it.slug}`} className="relative w-24 h-32 shrink-0 bg-[var(--brand-cream-deep)] overflow-hidden">
                    {it.image ? <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" /> : <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-[var(--brand-charcoal)]/25">G</div>}
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link href={`/products/${it.slug}`} className="font-serif text-lg font-light text-[var(--brand-charcoal)] leading-snug hover:text-[var(--brand-rose)] transition-colors line-clamp-2">{it.name}</Link>
                    {it.size && <span className="text-[11px] tracking-[0.15em] uppercase text-gray-400 mt-1">Size: {it.size}</span>}
                    <span className="font-serif text-lg font-semibold text-[var(--brand-charcoal)] mt-1">{formatPrice(it.price)}</span>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-[var(--brand-charcoal)]/15">
                        <button onClick={() => setQty(it.id, it.size, it.qty - 1)} aria-label="Decrease" className="w-9 h-9 flex items-center justify-center hover:bg-[var(--brand-pink)]/15 active:scale-90 transition"><Minus size={14} /></button>
                        <span className="w-9 text-center text-sm tabular-nums">{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.size, it.qty + 1)} aria-label="Increase" className="w-9 h-9 flex items-center justify-center hover:bg-[var(--brand-pink)]/15 active:scale-90 transition"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(it.id, it.size)} aria-label="Remove" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /> Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[var(--brand-pink)]/30 p-6 lg:sticky lg:top-28">
                <h2 className="font-serif text-xl font-light text-[var(--brand-charcoal)] mb-5">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="tabular-nums">{formatPrice(cartTotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-gray-400">Calculated at checkout</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tax (GST)</span><span className="text-gray-400">Calculated at checkout</span></div>
                </div>
                <div className="border-t border-[var(--brand-pink)]/30 mt-4 pt-4 flex justify-between items-baseline">
                  <span className="text-[11px] tracking-[0.2em] uppercase text-gray-500">Total</span>
                  <span className="font-serif text-2xl font-semibold text-[var(--brand-charcoal)] tabular-nums">{formatPrice(cartTotal)}</span>
                </div>
                <button onClick={() => router.push('/checkout')} className="w-full min-h-[52px] mt-5 bg-[var(--brand-darkpink)] text-white text-xs tracking-[0.2em] uppercase hover:bg-[var(--brand-rose)] transition-colors active:scale-[0.99]">
                  Proceed to Checkout
                </button>
                <Link href="/shop" className="block text-center mt-3 text-[11px] tracking-[0.2em] uppercase text-[var(--brand-charcoal)]/60 hover:text-[var(--brand-rose)] transition-colors">Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
